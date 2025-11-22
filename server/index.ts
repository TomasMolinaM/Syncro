import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { setWSS, broadcast as wsBroadcast, broadcastUserList as wsBroadcastUserList } from './ws';
import path from 'path';
import { connectDB } from './db';
import mongoose from 'mongoose';
import cors from 'cors';
import MessageModel from './models/Message';
import UserModel from './models/User';
import apiRoutes from './routes/api';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Permitir requests desde el cliente Vite (desarrollo)
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
setWSS(wss);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRoutes);

let memoryMessages: ChatMessage[] = [];
const connectedUsers = new Map<WebSocket, string>();
const userSockets = new Map<string, Set<WebSocket>>();

/* -------------------- TIPOS -------------------- */
interface ChatMessage {
  type: string;
  user: string;
  text: string;
  timestamp: string;
}

/* -------------------- WEBSOCKET -------------------- */
wss.on('connection', async (ws: WebSocket) => {
  console.log('🔌 Nueva conexión WebSocket');

  const isDbConnected = mongoose.connection.readyState === 1;

  /* 1. ENVIAR HISTORIAL AL CONECTARSE */
  try {
    let history: ChatMessage[] = [];

    if (isDbConnected) {
      const docs = await MessageModel.find()
        .sort({ fecha_envio: 1 })
        .limit(50)
        .lean();

      history = docs.map((doc: any) => ({
        type: 'message',
        user: doc.remitente_nombre || (doc.remitente_id ? String(doc.remitente_id) : 'Sistema'),
        text: doc.contenido,
        timestamp: (doc.fecha_envio || doc.createdAt || new Date()).toISOString(),
      }));
      
      console.log(`📜 Enviando ${history.length} mensajes del historial`);
    } else {
      console.log('📝 Usando historial en memoria');
      history = memoryMessages;
    }

    if (ws.readyState === WebSocket.OPEN) {
      history.forEach(msg => {
        ws.send(JSON.stringify(msg));
      });
    }
  } catch (e) {
    console.error('❌ Error enviando historial:', e);
  }

  /* 2. RECIBIR MENSAJES */
  ws.on('message', async (rawData) => {
    try {
      const parsed = JSON.parse(rawData.toString());

      // LOGIN: Registrar usuario
      if (parsed.type === 'login') {
        const username = parsed.user;
        connectedUsers.set(ws, username);
        console.log(`👤 ${username} se ha identificado`);

        let set = userSockets.get(username);
        if (!set) {
          set = new Set<WebSocket>();
          userSockets.set(username, set);
        }
        set.add(ws);

        // Actualizar estado en DB
        if (set.size === 1 && isDbConnected) {
          try {
            await UserModel.findOneAndUpdate(
              { nombre_usuario: username },
              { $set: { estado: 'conectado' } },
              { new: true, upsert: false }
            );
          } catch (e) {
            console.warn('No se pudo actualizar estado de usuario:', e);
          }
        }

        // Enviar lista actualizada de usuarios a todos
        wsBroadcastUserList(Array.from(connectedUsers.values()));

        // Notificar que se unió
        wsBroadcast({
          type: 'message',
          user: 'Sistema',
          text: `${username} se ha unido al chat`,
          timestamp: new Date().toISOString(),
        });

        return;
      }

      // MENSAJE: Guardar y reenviar
      if (parsed.type === 'message') {
        const msgObj: ChatMessage = {
          type: 'message',
          user: parsed.user,
          text: parsed.text,
          timestamp: parsed.timestamp || new Date().toISOString(),
        };

        // Guardar en MongoDB o memoria
        if (isDbConnected) {
          try {
            await MessageModel.create({
              remitente_nombre: msgObj.user,
              contenido: msgObj.text,
              fecha_envio: msgObj.timestamp ? new Date(msgObj.timestamp) : new Date(),
              tipo_mensaje: 'texto',
            });
            console.log(`💾 Mensaje de ${msgObj.user} guardado en MongoDB`);
          } catch (e) {
            console.error('❌ Error guardando mensaje en MongoDB:', e);
            memoryMessages.push(msgObj);
          }
        } else {
          memoryMessages.push(msgObj);
          if (memoryMessages.length > 50) {
            memoryMessages.shift();
          }
          console.log(`💾 Mensaje guardado en memoria`);
        }

        // Broadcast a todos EXCEPTO al remitente
        const data = JSON.stringify(msgObj);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(data);
          }
        });
      }

    } catch (e) {
      console.error('❌ Error procesando mensaje:', e);
    }
  });

  /* 3. DESCONEXIÓN */
  ws.on('close', () => {
    const username = connectedUsers.get(ws);
    
    if (username) {
      console.log(`🔴 ${username} desconectado`);
      connectedUsers.delete(ws);

      const set = userSockets.get(username);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          userSockets.delete(username);
          
          if (isDbConnected) {
            UserModel.findOneAndUpdate(
              { nombre_usuario: username }, 
              { $set: { estado: 'desconectado' } }
            ).catch((e) => {
              console.warn('No se pudo actualizar estado a desconectado:', e);
            });
          }
        }
      }

      wsBroadcastUserList(Array.from(connectedUsers.values()));

      wsBroadcast({
        type: 'message',
        user: 'Sistema',
        text: `${username} se ha desconectado`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  /* 4. ERRORES */
  ws.on('error', (err) => {
    console.error('❌ Error en WebSocket:', err);
  });
});

/* -------------------- FUNCIONES AUXILIARES -------------------- */

// Enviar mensaje a todos los clientes
function broadcast(msg: ChatMessage) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Enviar lista de usuarios conectados
function broadcastUserList() {
  const userList = Array.from(connectedUsers.values());
  const data = JSON.stringify({
    type: 'users',
    list: userList,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log('✅ MongoDB conectado - Mensajes persistentes');
  })
  .catch(() => {
    console.warn('⚠️ MongoDB NO disponible - Modo memoria');
  })
  .finally(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  });