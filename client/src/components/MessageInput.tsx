import { useState } from "react";

interface Props {
  sendMessage: (msg: string) => void;
  disabled: boolean;
}

export default function MessageInput({ sendMessage, disabled }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder={disabled ? "Ingresa tu nombre primero..." : "Escribe tu mensaje..."}
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        className="btn btn-primary" 
        onClick={handleSend} 
        disabled={disabled || !text.trim()}
      >
        Enviar
      </button>
    </div>
  );
}