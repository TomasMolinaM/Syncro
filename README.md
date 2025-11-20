# Syncro
Chat colaborativo en tiempo real con WebSockets, Node.js y MongoDB.

# Chat Colaborativo

1. Ejecuta `npm install`
2. Asegura que MongoDB corra en el puerto 27017.
3. Ejecuta `npm start`
4. Abre http://localhost:3000

Estructura del Proyecto

```text
chat-colaborativo-realtime/
├── .env                  (Variables de entorno)
├── .gitignore            (Ignorar node_modules y .env)
├── package.json          (Dependencias Node + TS Backend)
├── tsconfig.json         (Configuración TypeScript Backend)
├── README.md             (Documentación)
├── public/               (FRONTEND)
│   ├── index.html        (Punto de entrada HTML)
│   └── js/               (Lógica Modular)
│       ├── main.js       (Orquestador Principal)
│       ├── socket.js     (Clase para WebSocket)
│       └── ui.js         (Manejo del DOM/Interfaz)
└── server/               (BACKEND TypeScript)
    ├── index.ts          (Servidor Principal)
    └── mongo_connection.ts (Conexión DB)

```
