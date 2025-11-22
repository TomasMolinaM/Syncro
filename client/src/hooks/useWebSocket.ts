import { useEffect, useRef, useState } from "react";
import { MessageType } from "../types";

const API_MESSAGES = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/messages';

export default function useWebSocket() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Cargar historial vía REST y luego conectar WebSocket
  useEffect(() => {
    let mounted = true;

    // 1) Fetch historial
    (async () => {
      try {
        const res = await fetch(API_MESSAGES);
        if (!res.ok) throw new Error('No se pudo cargar historial');
        const data = await res.json();
        if (mounted) {
          // Mapear a MessageType esperado por el frontend
          const msgs: MessageType[] = data.map((m: any) => ({
            user: m.remitente_nombre || (m.remitente_id ? String(m.remitente_id) : 'Sistema'),
            text: m.contenido,
            timestamp: m.fecha_envio || m.createdAt || Date.now(),
          }));
          setMessages(msgs);
        }
      } catch (e) {
        console.warn('No se pudo obtener historial por REST, seguirá intentando por WS', e);
      }
    })();

    // 2) Conectar WS
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
    return () => {
      mounted = false;
      socket.close();
    };
  }, []); // <-- SE EJECUTA SOLO UNA VEZ ✔

  // Login manual (solo cuando el usuario confirme su nombre)
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

  // Mandar mensajes con el mismo WebSocket
  const sendMessage = (username: string, text: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("No se puede enviar, socket desconectado");
      return;
    }

    const timestamp = new Date().toISOString();

    const msg = {
      type: "message",
      user: username,
      text,
      timestamp,
    };

    // Enviar por WS (realtime)
    socketRef.current.send(JSON.stringify(msg));

    // Además, intentar persistir vía REST como fallback (no bloquear)
    fetch(API_MESSAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        remitente_nombre: username,
        contenido: text,
        fecha_envio: timestamp,
        tipo_mensaje: 'texto',
      }),
    }).catch((e) => console.warn('No se pudo persistir mensaje por REST', e));
  };

  return { messages, users, login, sendMessage };
}
