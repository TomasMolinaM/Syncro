import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri: string = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName: string = process.env.MONGO_DB_NAME || 'chat_db';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db | void> {
    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
        console.log("✅ Conectado a MongoDB (TypeScript)");
        return db;
    } catch (e) {
        console.error("❌ Error MongoDB:", e);
        console.warn("⚠️  Continuando en modo MEMORIA (sin persistencia)");
        // NO matamos el proceso, simplemente retornamos
        client = null;
        db = null;
    }
}

export function getDB(): Db | null {
    return db;
}

export async function closeDB(): Promise<void> {
    if (client) {
        await client.close();
        console.log('MongoDB desconectado');
    }
}