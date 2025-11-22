import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Estado para el mensaje verde
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  // Estados para login
  const [loginData, setLoginData] = useState({
    nombre_usuario: '',
    contrasena: '',
  });

  // Estados para registro
  const [registerData, setRegisterData] = useState({
    nombre_usuario: '',
    nombre_completo: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  });

  // Función para cambiar de pestaña limpiando los mensajes de error/éxito
  const toggleTab = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(loginData.nombre_usuario, loginData.contrasena);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerData.contrasena !== registerData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (registerData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register({
        nombre_usuario: registerData.nombre_usuario,
        nombre_completo: registerData.nombre_completo,
        correo: registerData.correo,
        contrasena: registerData.contrasena,
        rol: 'usuario',
      });

      // --- LÓGICA DE ÉXITO ---
      // 1. Cambiar a la pestaña de Iniciar Sesión
      setIsLogin(true);

      // 2. Mostrar mensaje verde de éxito
      setSuccess('¡Registro exitoso! Por favor inicia sesión.');

      // 3. Rellenar el campo de usuario automáticamente para comodidad
      setLoginData(prev => ({ ...prev, nombre_usuario: registerData.nombre_usuario }));

      // 4. Limpiar el formulario de registro
      setRegisterData({
        nombre_usuario: '',
        nombre_completo: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
      });

    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4">

              {/* Header */}
              <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
                <h2 className="mb-0">
                  <i className="bi bi-chat-dots-fill me-2"></i>
                  Syncro
                </h2>
              </div>

              <div className="card-body p-4">
                {/* Tabs de Navegación */}
                <ul className="nav nav-tabs mb-4" role="tablist">
                  <li className="nav-item flex-fill" role="presentation">
                    <button
                      className={`nav-link w-100 ${isLogin ? 'active' : ''}`}
                      onClick={() => toggleTab(true)}
                    >
                      Iniciar Sesión
                    </button>
                  </li>
                  <li className="nav-item flex-fill" role="presentation">
                    <button
                      className={`nav-link w-100 ${!isLogin ? 'active' : ''}`}
                      onClick={() => toggleTab(false)}
                    >
                      Registrarse
                    </button>
                  </li>
                </ul>

                {/* Alerta de Error (Rojo) */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                  </div>
                )}

                {/* Alerta de Éxito (Verde) */}
                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i> {success}
                  </div>
                )}

                {/* Formulario de Login */}
                {isLogin ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Usuario</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tu nombre de usuario"
                        value={loginData.nombre_usuario}
                        onChange={(e) => setLoginData({ ...loginData, nombre_usuario: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Tu contraseña"
                        value={loginData.contrasena}
                        onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
                      {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                    <p className="text-center text-muted small mb-0">
                      Al usar este servicio, aceptas nuestros términos y condiciones
                    </p>
                  </form>
                ) : (
                  /* Formulario de Registro */
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nombre de usuario</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Elige un nombre de usuario"
                        value={registerData.nombre_usuario}
                        onChange={(e) => setRegisterData({ ...registerData, nombre_usuario: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nombre completo</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tu nombre completo"
                        value={registerData.nombre_completo}
                        onChange={(e) => setRegisterData({ ...registerData, nombre_completo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Correo electrónico</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="tu@email.com"
                        value={registerData.correo}
                        onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        value={registerData.contrasena}
                        onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Confirmar contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Repite tu contraseña"
                        value={registerData.confirmarContrasena}
                        onChange={(e) => setRegisterData({ ...registerData, confirmarContrasena: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
                      {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                  </form>
                )}


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}