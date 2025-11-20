# Syncro
Chat colaborativo en tiempo real con WebSockets, Node.js y MongoDB.

# Chat Colaborativo

1. Ejecuta `npm install`
2. Asegura que MongoDB corra en el puerto 27017.
3. Ejecuta `npm start`
4. Abre http://localhost:3000

Estructura del Proyecto
chat-colaborativo-realtime/
├── .env                  (Tus claves secretas)
├── .gitignore            (Ignora node_modules y .env)
├── package.json          (El archivo que puse arriba)
├── tsconfig.json         (Configuración de TypeScript)
├── README.md             (Documentación)
├── public/               (CARPETA FRONTEND)
│   ├── index.html        (Tu cliente web, sigue siendo HTML)
│   └── README.md
└── server/               (CARPETA BACKEND)
    ├── index.ts          (Servidor principal, ahora es .ts)
    ├── mongo_connection.ts (Conexión DB, ahora es .ts)
    └── README.md