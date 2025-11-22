import { Request, Response } from 'express';
import UserModel from '../models/User';

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await UserModel.find().lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Error listando usuarios' });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log('createUser payload:', payload);
    const created = await UserModel.create(payload);
    console.log('createUser created:', (created as any)._id);
    res.status(201).json(created);
  } catch (e) {
    console.error('Error creando usuario:', e);
    res.status(400).json({ error: 'Error creando usuario', details: (e as any)?.message || String(e) });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await UserModel.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Error actualizando usuario' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
}
