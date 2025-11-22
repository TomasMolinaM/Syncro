import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginAsGuest } = useAuth();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

    // Validaciones
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
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginAsGuest();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario invitado');
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
                  Chat Colaborativo
                </h2>
              </div>

              <div className="card-body p-4">
                {/* Tabs */}
                <ul className="nav nav-tabs mb-4" role="tablist">
                  <li className="nav-item flex-fill" role="presentation">
                    <button
                      className={`nav-link w-100 ${isLogin ? 'active' : ''}`}
                      onClick={() => {
                        setIsLogin(true);
                        setError('');
                      }}
                    >
                      Iniciar Sesión
                    </button>
                  </li>
                  <li className="nav-item flex-fill" role="presentation">
                    <button
                      className={`nav-link w-100 ${!isLogin ? 'active' : ''}`}
                      onClick={() => {
                        setIsLogin(false);
                        setError('');
                      }}
                    >
                      Registrarse
                    </button>
                  </li>
                </ul>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {/* Login Form */}
                {isLogin ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Usuario</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tu nombre de usuario"
                        value={loginData.nombre_usuario}
                        onChange={(e) =>
                          setLoginData({ ...loginData, nombre_usuario: e.target.value })
                        }
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
                        onChange={(e) =>
                          setLoginData({ ...loginData, contrasena: e.target.value })
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Iniciar Sesión
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Register Form */
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nombre de usuario</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Elige un nombre de usuario"
                        value={registerData.nombre_usuario}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, nombre_usuario: e.target.value })
                        }
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
                        onChange={(e) =>
                          setRegisterData({ ...registerData, nombre_completo: e.target.value })
                        }
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
                        onChange={(e) =>
                          setRegisterData({ ...registerData, correo: e.target.value })
                        }
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
                        onChange={(e) =>
                          setRegisterData({ ...registerData, contrasena: e.target.value })
                        }
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
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            confirmarContrasena: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Registrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus-fill me-2"></i>
                          Crear Cuenta
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Divisor */}
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="px-3 text-muted small">O</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Guest Button */}
                <button
                  onClick={handleGuestLogin}
                  className="btn btn-outline-secondary w-100 py-2"
                  disabled={loading}
                >
                  <i className="bi bi-incognito me-2"></i>
                  Entrar como invitado
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-3 text-muted">
              <small>
                Al usar este servicio, aceptas nuestros términos y condiciones
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}