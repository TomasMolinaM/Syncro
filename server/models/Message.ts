import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sala_id?: mongoose.Types.ObjectId | null;
  remitente_id?: mongoose.Types.ObjectId | string | null;
  remitente_nombre?: string;
  contenido: string;
  tipo_mensaje: 'texto' | 'imagen' | 'archivo' | string;
  fecha_envio: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
  sala_id: { type: Schema.Types.ObjectId, ref: 'Room', required: false },
  remitente_id: { type: Schema.Types.Mixed, required: false },
  remitente_nombre: { type: String, required: false },
  contenido: { type: String, required: true },
  tipo_mensaje: { type: String, enum: ['texto', 'imagen', 'archivo'], default: 'texto' },
  fecha_envio: { type: Date, default: Date.now },
}, { timestamps: true });

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
export default MessageModel;
