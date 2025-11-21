import { useEffect, useRef, useState } from "react";
import { MessageType } from "../types";

export default function useWebSocket() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // 🚀 Conectar solo UNA VEZ al iniciar la app
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Conectado al servidor WebSocket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "users") {
        setUsers(data.list);
        return;
      }

      if (data.type === "message") {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onclose = () => {
      console.log("Desconectado del WebSocket");
    };

    // Cleanup al cerrar app
    return () => socket.close();
  }, []); // <-- SE EJECUTA SOLO UNA VEZ ✔

  // 🚀 Login manual (solo cuando el usuario confirme su nombre)
  const login = (username: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "login",
          user: username,
        })
      );
    }
  };

  // 🚀 Mandar mensajes con el mismo WebSocket
  const sendMessage = (username: string, text: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("No se puede enviar, socket desconectado");
      return;
    }

    const msg = {
      type: "message",
      user: username,
      text,
      timestamp: Date.now(),
    };

    socketRef.current.send(JSON.stringify(msg));
  };

  return { messages, users, login, sendMessage };
}
