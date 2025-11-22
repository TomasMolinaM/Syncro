import { useEffect, useRef, useState } from "react";
import { MessageType } from "../types";

export default function useWebSocket() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Conectado al servidor WebSocket");
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
      console.log("❌ Desconectado del WebSocket");
    };

    socket.onerror = (error) => {
      console.error("⚠️ Error WebSocket:", error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

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

  const sendMessage = (username: string, text: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("⚠️ No se puede enviar, socket desconectado");
      return;
    }

    const msg: MessageType = {
      type: "message",
      user: username,
      text,
      timestamp: new Date().toISOString(),
    };

    // Agregar mensaje localmente de inmediato (optimistic update)
    setMessages((prev) => [...prev, msg]);

    // Enviar al servidor (broadcast a otros, pero NO regresa a ti)
    socketRef.current.send(JSON.stringify(msg));
  };

  return { messages, users, login, sendMessage };
}