import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserResponse } from '../services/authService';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (nombre_usuario: string, contrasena: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parseando usuario guardado:', e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (nombre_usuario: string, contrasena: string) => {
    try {
      const userData = await authService.login({ nombre_usuario, contrasena });
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      // MODIFICACIÓN: Solo llamamos a la API para crear el usuario.
      // NO guardamos la sesión (setUser) aquí para evitar que te mande al chat automáticamente.
      await authService.register(data);
    } catch (error) {
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      const guestData = await authService.createGuest();
      setUser(guestData);
      localStorage.setItem('user', JSON.stringify(guestData));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Intentar notificar al servidor antes de borrar datos locales
    if (user && user.nombre_usuario) {
        try {
            // Asumiendo que authService tiene el método logout implementado
            if (typeof authService.logout === 'function') {
                await authService.logout(user.nombre_usuario);
            }
        } catch (error) {
            console.error('Error notificando logout:', error);
        }
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}