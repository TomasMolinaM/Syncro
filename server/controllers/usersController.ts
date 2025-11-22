import { Request, Response } from 'express';
import UserModel from '../models/User';

// --- LOGIN (Ya existente) ---
export async function login(req: Request, res: Response) {
  try {
    const { nombre_usuario, contrasena } = req.body;
    const user = await UserModel.findOne({ nombre_usuario });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Cambiar estado a 'conectado'
    user.estado = 'conectado';
    await user.save(); 

    res.json({ message: 'Login exitoso', user });
  } catch (e) {
    console.error('Error en login:', e);
    res.status(500).json({ error: 'Error iniciando sesión' });
  }
}

// --- NUEVA FUNCIÓN: LOGOUT ---
export async function logout(req: Request, res: Response) {
  try {
    const { nombre_usuario } = req.body;

    // Buscamos al usuario y forzamos el estado 'desconectado'
    const user = await UserModel.findOneAndUpdate(
      { nombre_usuario }, 
      { estado: 'desconectado' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado para cerrar sesión' });
    }

    res.json({ message: 'Logout exitoso', estado: user.estado });
  } catch (e) {
    console.error('Error en logout:', e);
    res.status(500).json({ error: 'Error cerrando sesión' });
  }
}

// --- CRUD Users (Resto del archivo igual) ---
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
    const userPayload = { ...payload, estado: 'desconectado' };
    
    const created = await UserModel.create(userPayload);
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