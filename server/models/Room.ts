import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  nombre: string;
  tipo: 'publica' | 'privada' | 'dm' | string;
  miembros: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  creado_por: mongoose.Types.ObjectId;
}

const RoomSchema: Schema<IRoom> = new Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, enum: ['publica', 'privada', 'dm'], default: 'publica' },
  miembros: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  creado_por: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);
export default RoomModel;
