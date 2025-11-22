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

interface BackendLoginResponse {
    message: string;
    user: UserResponse;
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

  // Login (verificar credenciales y conectar)
  async login(data: LoginData): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al verificar credenciales');
    }

    const result: BackendLoginResponse = await response.json();
    return result.user;
  },

  // --- NUEVO MÉTODO LOGOUT ---
  // Avisa al backend para cambiar estado a 'desconectado'
  async logout(nombre_usuario: string): Promise<void> {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre_usuario }),
    });
  },
  // ---------------------------

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