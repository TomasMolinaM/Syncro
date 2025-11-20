// Módulo Principal (Orquestador)
// Conecta la lógica del Socket con la Interfaz de Usuario.

import { UI } from './ui.js';
import { ChatSocket } from './socket.js';

// 1. Determinar URL y crear instancia del Socket
const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${location.host}`;
const socketService = new ChatSocket(wsUrl);

// Estado local
let myUserId = null;

// 2. Configurar eventos del Socket (Qué hacer cuando llegan datos)
socketService.onConnect = () => {
    UI.setStatus('connected');
};

socketService.onDisconnect = () => {
    UI.setStatus('disconnected');
};

socketService.onMessageReceived = (data) => {
    // Caso A: Historial
    if (data.type === 'history') {
        data.messages.forEach(msg => UI.renderMessage(msg, myUserId));
        return;
    }

    // Caso B: Detectar mi ID (cuando recibo mi propio mensaje de 'unido')
    // Esta es una simplificación. Idealmente el server mandaría un mensaje tipo 'welcome'.
    if (!myUserId && data.type === 'status' && data.text && data.text.includes('unido')) {
        myUserId = data.user;
        UI.setUserName(myUserId);
    }

    // Caso C: Renderizar mensaje normal
    UI.renderMessage(data, myUserId);
};

// 3. Configurar eventos de la UI (Qué hacer cuando el usuario interactúa)
const form = document.getElementById('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = UI.getInputValue();
    
    if (text) {
        socketService.sendMessage(text);
        UI.clearInput();
    }
});

// 4. Iniciar conexión
socketService.connect();