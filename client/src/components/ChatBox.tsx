import { useEffect, useRef } from "react";
import { MessageType } from "../types";

interface Props {
  messages: MessageType[];
  currentUser?: string;
}

export default function ChatBox({ messages, currentUser }: Props) {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={chatRef}
      className="border rounded mb-3 p-3 bg-light"
      style={{
        height: "400px",
        overflowY: "scroll",
      }}
    >
      {messages.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <p>No hay mensajes aún</p>
          <small>Sé el primero en enviar un mensaje</small>
        </div>
      ) : (
        messages.map((msg, i) => {
          const isSystemMessage = msg.user === 'Sistema';
          const isMyMessage = msg.user === currentUser;
          const timestamp = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })
            : '';

          // Mensajes del sistema (centrados y difuminados)
          if (isSystemMessage) {
            return (
              <div key={i} className="text-center my-3">
                <small
                  className="text-muted fst-italic"
                  style={{
                    opacity: 0.6,
                    fontSize: '0.85rem'
                  }}
                >
                  {msg.text}
                </small>
              </div>
            );
          }

          // Mensajes normales de usuarios
          return (
            <div
              key={i}
              className={`mb-2 d-flex ${isMyMessage ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-2 rounded ${isMyMessage
                    ? 'bg-primary text-white'
                    : 'bg-white border'
                  }`}
                style={{ maxWidth: '70%' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className={`fw-bold ${isMyMessage ? 'text-white' : 'text-primary'}`}>
                    {msg.user}
                  </small>
                  {timestamp && (
                    <small className={`ms-2 ${isMyMessage ? 'text-white-50' : 'text-muted'}`}>
                      {timestamp}
                    </small>
                  )}
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}