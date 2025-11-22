# Server — Configuración de MongoDB Atlas

Pasos para configurar el backend para usar MongoDB Atlas:

1) Copia `.env.example` a `.env` en la raíz del proyecto y reemplaza la URI por la real (si no lo hiciste ya):

```powershell
copy .env.example .env
# Edita .env para confirmar valores
notepad .env
```

2) Instala las dependencias necesarias (si no están instaladas):

```powershell
npm install mongoose
npm install -D @types/mongoose
```

3) Inicia la aplicación en modo desarrollo:

```powershell
npm run dev
```

4) Notas sobre migración de datos (local -> Atlas):

- Usando `mongodump` / `mongorestore`:

```powershell
# Hacer dump de la base local
mongodump --uri="mongodb://localhost:27017/tu_db_local" --out=dump

# Restaurar en Atlas
mongorestore --uri="mongodb+srv://<user>:<pass>@cluster.../" --nsInclude="tu_db_local.*" dump/tu_db_local
```

- Usando `mongoexport` / `mongoimport` (para JSON/CSV):

```powershell
mongoexport --uri="mongodb://localhost:27017/tu_db_local" -c mensajes -o mensajes.json
mongoimport --uri="mongodb+srv://<user>:<pass>@cluster.../syncro_db" -c mensajes --file mensajes.json
```

5) Seguridad:
- No subas `.env` con credenciales al repositorio.
- Usa usuarios con permisos mínimos para la conexión de la app.

Si quieres, puedo crear el `.env` directamente con la URI que compartiste, o puedo ejecutar (guiarte sobre) los comandos de migración que prefieras.
