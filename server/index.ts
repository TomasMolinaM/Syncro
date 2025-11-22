import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { setWSS, broadcast as wsBroadcast, broadcastUserList as wsBroadcastUserList } from './ws';
import path from 'path';
import { connectDB } from './db';
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
const connectedUsers = new Map<WebSocket, string>(); // ← Mapa de usuarios

// Map to track sockets per username so we can support multiple tabs/sockets per user
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

  // Usaremos el modelo Message cuando haya conexión a MongoDB (mongoose)
  const isDbConnected = !!MessageModel && (MessageModel.db != null);

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
    } else {
      history = memoryMessages;
    }

    if (ws.readyState === WebSocket.OPEN) {
      // Enviar historial de mensajes
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

        // Track this websocket under the username
        let set = userSockets.get(username);
        if (!set) {
          set = new Set<WebSocket>();
          userSockets.set(username, set);
        }
        set.add(ws);

        // If this is the first socket for this user, mark connected in DB
        if (set.size === 1) {
          try {
            // Only attempt DB update if mongoose is connected
            if ((MessageModel as any).db) {
              await UserModel.findOneAndUpdate(
                { nombre_usuario: username },
                { $set: { estado: 'conectado', nombre_usuario: username } },
                { new: true, upsert: true }
              );
            }
          } catch (e) {
            console.warn('No se pudo actualizar estado de usuario a conectado:', e);
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

          // Guardar en MongoDB (usando MessageModel) o memoria
          if (isDbConnected) {
            try {
              await MessageModel.create({
                remitente_nombre: msgObj.user,
                contenido: msgObj.text,
                fecha_envio: msgObj.timestamp ? new Date(msgObj.timestamp) : new Date(),
                tipo_mensaje: 'texto',
              });
            } catch (e) {
              console.error('❌ Error guardando mensaje en MongoDB:', e);
            }
          } else {
            memoryMessages.push(msgObj);
            if (memoryMessages.length > 50) {
              memoryMessages.shift();
            }
          }

        // Broadcast a todos
        wsBroadcast(msgObj);
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

      // Remove this socket from the user's set
      const set = userSockets.get(username);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          userSockets.delete(username);
          // This was the last socket for the user: mark as disconnected in DB
          try {
            if ((MessageModel as any).db) {
              UserModel.findOneAndUpdate({ nombre_usuario: username }, { $set: { estado: 'desconectado' } }).catch((e) => {
                console.warn('No se pudo actualizar estado a desconectado:', e);
              });
            }
          } catch (e) {
            console.warn('Error marcando usuario desconectado:', e);
          }
        }
      }

      // Actualizar lista de usuarios
      wsBroadcastUserList(Array.from(connectedUsers.values()));

      // Notificar que se fue
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