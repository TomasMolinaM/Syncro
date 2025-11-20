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

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

let userCount = 0;

// Interfaz para nuestro WebSocket personalizado con userId
interface CustomWebSocket extends WebSocket {
    userId?: string;
}

// Interfaz para la estructura del mensaje
interface ChatMessage {
    type: string;
    user: string;
    text: string;
    timestamp: Date;
}

wss.on('connection', async (ws: CustomWebSocket) => {
    userCount++;
    const userId = `Usuario_${userCount}`;
    ws.userId = userId;

    console.log(`🔌 ${userId} conectado`);

    const db = getDB();
    const collection = db ? db.collection('messages') : null;

    // 1. Enviar historial
    if (collection) {
        try {
            const history = await collection.find().sort({ timestamp: 1 }).limit(50).toArray();
            ws.send(JSON.stringify({ type: 'history', messages: history }));
        } catch (e) {
            console.error("Error historial:", e);
        }
    }

    // 2. Notificar unión
    broadcast({ type: 'status', user: userId, text: 'se ha unido', timestamp: new Date() });

    // 3. Escuchar mensajes
    ws.on('message', async (data: string) => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'chat') {
                const msgObj: ChatMessage = {
                    type: 'chat',
                    user: userId,
                    text: parsed.text,
                    timestamp: new Date()
                };

                if (collection) await collection.insertOne(msgObj);
                broadcast(msgObj);
            }
        } catch (e) {
            console.error("Error mensaje:", e);
        }
    });

    // 4. Desconexión
    ws.on('close', () => {
        broadcast({ type: 'status', user: userId, text: 'se ha desconectado', timestamp: new Date() });
    });
});

function broadcast(msg: any) {
    const data = JSON.stringify(msg);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor TypeScript corriendo en http://localhost:${PORT}`);
    });
});