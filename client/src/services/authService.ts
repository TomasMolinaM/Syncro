const API_URL = 'http://localhost:3000/api';

export interface RegisterData {
  nombre_usuario: string;
  nombre_completo: string;
  correo: string;
  contrasena: string;
  rol?: 'admin' | 'dev' | 'usuario';
}

export interface LoginData {
  nombre_usuario: string;
  contrasena: string;
}

export interface UserResponse {
  _id: string;
  nombre_usuario: string;
  nombre_completo?: string;
  correo?: string;
  rol: string;
  estado: string;
}

export const authService = {
  // Registrar nuevo usuario
  async register(data: RegisterData): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar usuario');
    }

    return response.json();
  },

  // Login (verificar credenciales)
  async login(data: LoginData): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al verificar credenciales');
    }

    const users: UserResponse[] = await response.json();
    const user = users.find(
      (u) => u.nombre_usuario === data.nombre_usuario
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // TODO: Aquí deberías verificar la contraseña (cuando agregues bcrypt)
    // Por ahora solo verificamos que el usuario exista

    return user;
  },

  // Obtener todos los usuarios
  async getUsers(): Promise<UserResponse[]> {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }
    return response.json();
  },

  // Crear usuario invitado
  async createGuest(): Promise<UserResponse> {
    const animals = [
      'Rana', 'Panda', 'Koala', 'Pingüino', 'Mapache', 'Nutria',
      'Búho', 'Zorro', 'Gato', 'Conejo', 'Ardilla', 'Lechuza',
    ];

    const adjectives = [
      'Anónima', 'Anónimo', 'Misteriosa', 'Misterioso', 'Curiosa', 'Curioso',
    ];

    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;

    const guestName = `${randomAnimal}${randomAdj}${randomNum}`;

    return this.register({
      nombre_usuario: guestName,
      nombre_completo: 'Usuario Invitado',
      correo: '',
      contrasena: '',
      rol: 'usuario',
    });
  },
};