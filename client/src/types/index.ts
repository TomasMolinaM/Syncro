export interface MessageType {
  user: string;
  text: string;
  timestamp?: string | number | Date;
  // tipo de mensaje: 'message' para mensajes normales, 'status' para eventos del sistema
  type?: 'message' | 'status' | string;
}
