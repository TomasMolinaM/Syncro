import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Cargar .env desde la RAÍZ del proyecto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri: string = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/chat_db';

console.log('🔍 URI de MongoDB:', uri.substring(0, 20) + '...'); // Solo mostrar inicio para seguridad

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose | void> {
    try {
        if (isConnected && mongoose.connection.readyState === 1) {
            console.log('✅ Ya conectado a MongoDB');
            return mongoose;
        }

        const opts = {
            dbName: process.env.MONGO_DB_NAME || 'chat_db',
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        } as mongoose.ConnectOptions;

        console.log('🔄 Intentando conectar a MongoDB...');
        await mongoose.connect(uri, opts);
        isConnected = true;
        console.log('✅ Conectado a MongoDB Atlas (mongoose)');
        console.log('📊 Base de datos:', mongoose.connection.name);
        return mongoose;
    } catch (e) {
        isConnected = false;
        console.error('❌ Error conectando a MongoDB:', (e as Error).message);
        console.warn('⚠️  Continuando en modo MEMORIA (sin persistencia)');
    }
}

export function isDbConnected(): boolean {
    return isConnected && mongoose.connection.readyState === 1;
}

export async function closeDB(): Promise<void> {
    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('MongoDB (mongoose) desconectado');
    } catch (e) {
        console.warn('Error desconectando mongoose:', e);
    }
}

export default mongoose;