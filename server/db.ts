import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri: string = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName: string = process.env.MONGO_DB_NAME || 'chat_db';

const client = new MongoClient(uri);
let db: Db | null = null;

export async function connectDB(): Promise<Db | void> {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("✅ Conectado a MongoDB (TypeScript)");
        return db;
    } catch (e) {
        console.error("❌ Error MongoDB:", e);
        process.exit(1);
    }
}

export function getDB(): Db | null {
    return db;
}