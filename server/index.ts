import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { connectDB, getDB } from './db';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, '../public')));

let memoryMessages: ChatMessage[] = [];
const connectedUsers = new Map<WebSocket, string>(); // ← Mapa de usuarios

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

  const db = getDB();
  const collection = db ? db.collection<ChatMessage>('messages') : null;

  /* 1. ENVIAR HISTORIAL AL CONECTARSE */
  try {
    let history: ChatMessage[] = [];

    if (collection) {
      const docs = await collection
        .find()
        .sort({ timestamp: 1 })
        .limit(50)
        .toArray();
      
      history = docs.map(doc => ({
        type: 'message',
        user: doc.user,
        text: doc.text,
        timestamp: doc.timestamp,
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
        
        // Enviar lista actualizada de usuarios a todos
        broadcastUserList();
        
        // Notificar que se unió
        broadcast({
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
        if (collection) {
          await collection.insertOne({
            ...msgObj,
            timestamp: msgObj.timestamp,
          } as any);
        } else {
          memoryMessages.push(msgObj);
          if (memoryMessages.length > 50) {
            memoryMessages.shift();
          }
        }

        // Broadcast a todos
        broadcast(msgObj);
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
      
      // Actualizar lista de usuarios
      broadcastUserList();
      
      // Notificar que se fue
      broadcast({
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