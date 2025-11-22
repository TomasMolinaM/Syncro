import { Request, Response } from 'express';
import MessageModel from '../models/Message';
import { broadcast } from '../ws';

export async function listMessages(req: Request, res: Response) {
  try {
    const { roomId, limit = 50 } = req.query as any;
    const filter: any = {};
    if (roomId) filter.sala_id = roomId;
    const msgs = await MessageModel.find(filter).sort({ fecha_envio: 1 }).limit(Number(limit)).lean();
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ error: 'Error listando mensajes' });
  }
}

export async function createMessage(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log('createMessage payload:', payload);
    const created = await MessageModel.create(payload);
    console.log('createMessage created:', (created as any)._id);
    // Broadcast to websocket clients so frontends receive the new message
    try {
      broadcast({
        type: 'message',
        user: (created as any).remitente_nombre || ((created as any).remitente_id || 'Sistema'),
        text: (created as any).contenido,
        timestamp: ((created as any).fecha_envio || (created as any).createdAt || new Date()).toISOString(),
      });
    } catch (e) {
      console.warn('No se pudo hacer broadcast del mensaje creado', e);
    }

    res.status(201).json(created);
  } catch (e) {
    console.error('Error creando mensaje:', e);
    res.status(400).json({ error: 'Error creando mensaje', details: (e as any)?.message || String(e) });
  }
}
