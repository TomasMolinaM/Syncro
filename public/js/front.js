// Módulo de Interfaz de Usuario (UI)
// Solo maneja el DOM y actualizaciones visuales.

const chatBox = document.getElementById('chat-box');
const statusDisplay = document.getElementById('status');
const chatTitle = document.getElementById('chat-title');
const msgInput = document.getElementById('input');

export const UI = {
    // Actualiza el indicador de estado (Conectado/Desconectado)
    setStatus(status) {
        if (status === 'connected') {
            statusDisplay.textContent = '🟢 Conectado';
            statusDisplay.classList.replace('bg-blue-700', 'bg-green-500');
            statusDisplay.classList.replace('bg-red-500', 'bg-green-500');
        } else if (status === 'disconnected') {
            statusDisplay.textContent = '🔴 Desconectado';
            statusDisplay.classList.replace('bg-green-500', 'bg-red-500');
            statusDisplay.classList.replace('bg-blue-700', 'bg-red-500');
        }
    },

    // Actualiza el título con el ID del usuario
    setUserName(userId) {
        chatTitle.textContent = `💬 Chat (${userId})`;
    },

    // Limpia el input después de enviar
    clearInput() {
        msgInput.value = '';
        msgInput.focus();
    },

    // Obtiene el texto del input
    getInputValue() {
        return msgInput.value.trim();
    },

    // Renderiza un mensaje en la pantalla
    renderMessage(msg, myId) {
        const div = document.createElement('div');
        const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
        const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (msg.type === 'status') {
            // Mensaje de sistema
            div.className = 'text-center text-xs text-gray-400 my-2 italic';
            div.innerText = `${msg.user} ${msg.text} - ${timeString}`;
        } else {
            // Mensaje de chat
            const isMe = msg.user === myId;
            const alignClass = isMe ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-200 text-gray-800';
            const userColor = isMe ? 'text-blue-100' : 'text-blue-600';
            const timeColor = isMe ? 'text-blue-200' : 'text-gray-500';

            div.className = `p-3 rounded-lg shadow-sm border border-gray-100 max-w-[80%] ${alignClass}`;
            div.innerHTML = `
                <div class="flex justify-between items-baseline mb-1 gap-4">
                    <span class="font-bold text-sm ${userColor}">${msg.user}</span>
                    <span class="text-xs ${timeColor}">${timeString}</span>
                </div>
                <p class="break-words">${msg.text}</p>
            `;
        }

        chatBox.appendChild(div);
        this.scrollToBottom();
    },

    scrollToBottom() {
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 50);
    }
};