import { useEffect, useState } from "react";
// Asegúrate de que las rutas de importación coincidan con tu estructura
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";
import useWebSocket from "../hooks/useWebSocket";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { messages, users, login, sendMessage } = useWebSocket();
  const [hasJoinedChat, setHasJoinedChat] = useState(false);

  // Unirse al chat automáticamente cuando el usuario esté autenticado
  useEffect(() => {
    if (user && !hasJoinedChat) {
      login(user.nombre_usuario);
      setHasJoinedChat(true);
    }
  }, [user, hasJoinedChat, login]);

  const handleSend = (text: string) => {
    if (!user) return;
    sendMessage(user.nombre_usuario, text);
  };

  // --- MODIFICACIÓN AQUÍ ---
  const handleLogout = async () => {
    // 1. Esperamos a que el AuthContext avise al servidor (cambio a 'desconectado')
    await logout();

    // 2. Una vez que el servidor respondió (o falló), recargamos o redirigimos
    window.location.reload();
  };
  // -------------------------

  if (!user) return null;

  return (
    <div className="bg-slate-100 min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div className="w-100" style={{ maxWidth: "900px" }}>
        <div className="card shadow-lg">

          {/* Header */}
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">💬 Syncro</h4>
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-success">
                  👤 {user.nombre_completo || user.nombre_usuario}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-light"
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Salir
                </button>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="row">

              {/* Área principal del chat */}
              <div className="col-md-8">
                {/* Caja de mensajes */}
                <ChatBox messages={messages} currentUser={user.nombre_usuario} />

                {/* Input de mensaje */}
                <MessageInput
                  sendMessage={handleSend}
                  disabled={false}
                />
              </div>

              {/* Panel de usuarios */}
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-header bg-secondary text-white">
                    <h6 className="mb-0 text-center">
                      👥 Usuarios conectados ({users.length})
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush">
                      {users.length === 0 ? (
                        <li className="list-group-item text-muted text-center">
                          No hay usuarios conectados
                        </li>
                      ) : (
                        users.map((u) => (
                          <li
                            key={u}
                            className="list-group-item d-flex align-items-center"
                          >
                            <span className="badge bg-success rounded-pill me-2">●</span>
                            <span className={u === user.nombre_usuario ? 'fw-bold' : ''}>
                              {u} {u === user.nombre_usuario && '(Tú)'}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}