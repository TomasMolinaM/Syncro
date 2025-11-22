import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string) => void;
}

export default function LoginModal({ isOpen, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      createUserAndLogin(username.trim());
    }
  };

  const createUserAndLogin = async (name: string) => {
    try {
      setLoading(true);
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario: name }),
      });
    } catch (e) {
      console.warn('No se pudo crear usuario por API', e);
    } finally {
      setLoading(false);
      onLogin(name);
    }
  };

  const handleGuestLogin = () => {
    const animals = [
      'Rana', 'Panda', 'Koala', 'Pingüino', 'Mapache', 'Nutria', 
      'Búho', 'Zorro', 'Gato', 'Conejo', 'Ardilla', 'Lechuza',
      'Delfín', 'Foca', 'Loro', 'Tucán', 'Colibrí', 'Perezoso',
      'Alpaca', 'Llama', 'Erizo', 'Hamster', 'Capibara', 'Axolote'
    ];
    
    const adjectives = [
      'Anónima', 'Anónimo', 'Misteriosa', 'Misterioso', 'Curiosa', 'Curioso',
      'Sigilosa', 'Sigiloso', 'Traviesa', 'Travieso', 'Tranquila', 'Tranquilo',
      'Veloz', 'Ágil', 'Astuta', 'Astuto', 'Divertida', 'Divertido'
    ];
    
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    const guestName = `${randomAnimal}${randomAdj}${randomNum}`;
    createUserAndLogin(guestName);
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1050 }}
      ></div>

      {/* Modal */}
      <div 
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4"
        style={{ 
          zIndex: 1051, 
          width: "90%", 
          maxWidth: "450px",
          animation: "fadeInScale 0.3s ease-out"
        }}
      >
        <div className="text-center mb-4">
          <div className="mb-3">
            <span style={{ fontSize: "64px" }}>💬</span>
          </div>
          <h4 className="fw-bold mb-2">Bienvenido al Chat Colaborativo</h4>
          <p className="text-muted">¿Cómo quieres que te identifiquemos?</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tu nombre</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Ej: Juan Pérez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <div className="form-text">
              Este será tu nombre visible en el chat
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 mb-2"
            disabled={!username.trim()}
          >
            <i className="bi bi-person-check me-2"></i>
            Unirse con mi nombre
          </button>
        </form>

        {/* Divisor */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="px-3 text-muted small">O</span>
          <hr className="flex-grow-1" />
        </div>

        {/* Botón invitado */}
        <button 
          onClick={handleGuestLogin}
          className="btn btn-outline-secondary btn-lg w-100"
          disabled={loading}
        >
          <i className="bi bi-incognito me-2"></i>
          Entrar como invitado
        </button>

        <div className="text-center mt-3">
          <small className="text-muted">
            Al unirte, aceptas las reglas de convivencia del chat
          </small>
        </div>
      </div>
    </>
  );
}