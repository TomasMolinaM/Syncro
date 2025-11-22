import { useState } from "react";
import ChatBox from "./components/ChatBox";
import MessageInput from "./components/MessageInput";
import LoginModal from "./components/LoginModal";
import useWebSocket from "./hooks/useWebSocket";

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { messages, users, login, sendMessage } = useWebSocket();

  const handleLogin = (name: string) => {
    setUsername(name);
    login(name);
    setIsLoggedIn(true);
  };

  // Send via API (server will persist and broadcast via WS)
  const handleSend = async (text: string) => {
    if (!username.trim()) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remitente_nombre: username,
          contenido: text,
          fecha_envio: new Date().toISOString(),
          tipo_mensaje: 'texto',
        }),
      });
    } catch (e) {
      console.warn('No se pudo enviar mensaje por API, intentando via WS...', e);
      // fallback to WS sendMessage if API fails
      sendMessage(username, text);
    }
  };

  return (
    <>
      {/* Modal de Login */}
      <LoginModal isOpen={!isLoggedIn} onLogin={handleLogin} />

      {/* Aplicación principal */}
      <div className="bg-slate-100 min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: "900px" }}>
          <div className="card shadow-lg">
            
            {/* Header */}
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">💬 Chat Colaborativo</h4>
                {isLoggedIn && (
                  <span className="badge bg-success">
                    👤 {username}
                  </span>
                )}
              </div>
            </div>

            <div className="card-body">
              <div className="row">
                
                {/* Área principal del chat */}
                <div className="col-md-8">
                  {/* Caja de mensajes */}
                  <ChatBox messages={messages} currentUser={username} />

                  {/* Input de mensaje */}
                  <MessageInput 
                    sendMessage={handleSend}
                    disabled={!isLoggedIn} 
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
                              <span className={u === username ? 'fw-bold' : ''}>
                                {u} {u === username && '(Tú)'}
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
    </>
  );
}

export default App;