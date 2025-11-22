import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  nombre_usuario: string;
  nombre_completo?: string;
  correo?: string;
  contrasena?: string;
  rol: 'admin' | 'dev' | 'usuario' | string;
  estado: 'conectado' | 'desconectado' | 'ocupado' | string;
}

const UserSchema: Schema<IUser> = new Schema({
  nombre_usuario: { type: String, required: true, unique: true },
  nombre_completo: { type: String },
  correo: { type: String },
  contrasena: { type: String },
  rol: { type: String, enum: ['admin', 'dev', 'usuario'], default: 'usuario' },
  estado: { type: String, enum: ['conectado', 'desconectado', 'ocupado'], default: 'desconectado' },
}, { timestamps: true });

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
