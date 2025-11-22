import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri: string = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/chat_db';

export async function connectDB(): Promise<typeof mongoose | void> {
    try {
        // Opciones recomendadas
        const opts = {
            dbName: process.env.MONGO_DB_NAME || undefined,
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        } as mongoose.ConnectOptions;

        await mongoose.connect(uri, opts);
        console.log('✅ Conectado a MongoDB (mongoose)');
        return mongoose;
    } catch (e) {
        console.error('❌ Error conectando a MongoDB (mongoose):', e);
        console.warn('⚠️  Continuando en modo MEMORIA (sin persistencia)');
    }
}

export async function closeDB(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('MongoDB (mongoose) desconectado');
    } catch (e) {
        console.warn('Error desconectando mongoose:', e);
    }
}

export default mongoose;