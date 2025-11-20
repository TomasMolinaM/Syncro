// Módulo de WebSocket
// Solo maneja la conexión, eventos y envío de datos puros.

export class ChatSocket {
    constructor(url) {
        this.url = url;
        this.ws = null;
        
        // Callbacks que se asignarán desde main.js
        this.onConnect = null;
        this.onDisconnect = null;
        this.onMessageReceived = null;
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('WS Conectado');
            if (this.onConnect) this.onConnect();
        };

        this.ws.onclose = () => {
            console.log('WS Desconectado');
            if (this.onDisconnect) this.onDisconnect();
        };

        this.ws.onerror = (err) => {
            console.error('WS Error:', err);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.onMessageReceived) this.onMessageReceived(data);
            } catch (e) {
                console.error('Error parseando mensaje:', e);
            }
        };
    }

    sendMessage(text) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const payload = { type: 'chat', text: text };
            this.ws.send(JSON.stringify(payload));
        } else {
            alert('No hay conexión con el servidor.');
        }
    }
}