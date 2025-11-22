import { Request, Response } from 'express';
import UserModel from '../models/User';

// --- LOGIN ---
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

    user.estado = 'conectado';
    await user.save();

    res.json({ message: 'Login exitoso', user });
  } catch (e) {
    console.error('Error en login:', e);
    res.status(500).json({ error: 'Error iniciando sesión' });
  }
}

// --- LOGOUT ---
export async function logout(req: Request, res: Response) {
  try {
    const { nombre_usuario } = req.body;
    const user = await UserModel.findOneAndUpdate(
      { nombre_usuario },
      { estado: 'desconectado' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Logout exitoso', estado: user.estado });
  } catch (e) {
    res.status(500).json({ error: 'Error cerrando sesión' });
  }
}

// --- CREATE USER (REGISTRO) ---
export async function createUser(req: Request, res: Response) {
  try {
    const payload = req.body;
    const { nombre_usuario, correo } = payload;

    // 1. Validar usuario existente
    const existingUser = await UserModel.findOne({ nombre_usuario });
    if (existingUser) {
      return res.status(400).json({ error: 'usuario ya existente' });
    }

    // 2. Validar correo existente
    if (correo) {
      const existingEmail = await UserModel.findOne({ correo });
      if (existingEmail) {
        return res.status(400).json({ error: 'correo ya registrado' });
      }
    }

    // 3. Crear usuario
    const userPayload = { ...payload, estado: 'desconectado' };
    const created = await UserModel.create(userPayload);

    res.status(201).json(created);
  } catch (e) {
    console.error('Error registro:', e);
    res.status(400).json({ error: 'Error creando usuario' });
  }
}

// --- OTROS METODOS CRUD ---

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

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await UserModel.findByIdAndUpdate(id, req.body, { new: true }).lean();
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