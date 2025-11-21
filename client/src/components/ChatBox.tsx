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
        overflowY: "scroll", // ← Cambio de "auto" a "scroll"
      }}
    >
      {messages.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <p>No hay mensajes aún</p>
          <small>Sé el primero en enviar un mensaje</small>
        </div>
      ) : (
        messages.map((msg, i) => {
          const isMyMessage = msg.user === currentUser;
          const timestamp = msg.timestamp 
            ? new Date(msg.timestamp).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : '';

          return (
            <div
              key={i}
              className={`mb-2 d-flex ${isMyMessage ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-2 rounded ${
                  isMyMessage 
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