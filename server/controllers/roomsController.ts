import { Request, Response } from 'express';
import RoomModel from '../models/Room';

export async function listRooms(req: Request, res: Response) {
  try {
    const rooms = await RoomModel.find().populate('admins miembros', 'nombre_usuario nombre_completo').lean();
    res.json(rooms);
  } catch (e) {
    res.status(500).json({ error: 'Error listando salas' });
  }
}

export async function getRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const room = await RoomModel.findById(id).populate('admins miembros', 'nombre_usuario nombre_completo').lean();
    if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
    res.json(room);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo sala' });
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log('createRoom payload:', payload);
    const room = await RoomModel.create(payload);
    console.log('createRoom created:', (room as any)._id);
    res.status(201).json(room);
  } catch (e) {
    console.error('Error creando sala:', e);
    res.status(400).json({ error: 'Error creando sala', details: (e as any)?.message || String(e) });
  }
}

export async function joinRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const room = await RoomModel.findById(id);
    if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
    if (!room.miembros.includes(userId)) {
      room.miembros.push(userId);
      await room.save();
    }
    res.json(room);
  } catch (e) {
    res.status(400).json({ error: 'Error uniendo a la sala' });
  }
}

export async function leaveRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const room = await RoomModel.findById(id);
    if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
    room.miembros = room.miembros.filter(m => String(m) !== String(userId));
    await room.save();
    res.json(room);
  } catch (e) {
    res.status(400).json({ error: 'Error saliendo de la sala' });
  }
}
