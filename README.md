# USICAMM IA Studio

Plataforma de estudio para USICAMM con registro de usuarios, progreso persistente, simulador, ruta personalizada y tutor IA.

## Configuracion

1. Crea tu archivo `.env` tomando como base `.env.example`.
2. Pon tu API key de Groq:

```env
GROQ_API_KEY=tu_api_key_real_de_groq
GROQ_MODEL=llama-3.1-8b-instant
GROQ_BASE_URL=https://api.groq.com/openai/v1
PORT=4173
```

La API key se usa solo en el servidor. No se manda al navegador.

## Ejecutar

```bash
pnpm start
```

Abre:

```text
http://localhost:4173
```

Tambien funciona con:

```bash
npm start
```

## Desplegar en Render

El repo incluye `render.yaml`, asi que puedes crear el servicio desde Render como Blueprint.

1. Sube este repo a GitHub.
2. En Render entra a **New +** y elige **Blueprint**.
3. Selecciona el repo.
4. Render leera `render.yaml`.
5. En las variables marcadas como secretas agrega:

```env
GROQ_API_KEY=tu_key_de_groq
```

No definas `PORT` en Render. Render asigna el puerto automaticamente y la app ya usa `process.env.PORT`.

El Blueprint tambien crea una base PostgreSQL y conecta `DATABASE_URL` automaticamente. Eso evita perder usuarios y progreso cuando Render reinicia o despliega una nueva version.

## Si ves HTML en vez de JSON

Ese error pasa cuando se abre la pagina con un servidor estatico, pero no con el backend de `server.js`.

Deten cualquier servidor anterior y ejecuta:

```bash
pnpm start
```

Comprueba que esta URL responda JSON:

```text
http://localhost:4173/api/me
```

Debe mostrar algo como:

```json
{"error":"Necesitas iniciar sesion."}
```

## Base de datos

En Render, la app usa PostgreSQL mediante `DATABASE_URL`. En desarrollo local, si no defines `DATABASE_URL`, crea automaticamente `data/db.json` para guardar usuarios, sesiones y progreso. Ese archivo esta ignorado por Git para no subir datos reales.

## Seguridad de cuentas

- Las contrasenas se guardan con hash `scrypt`.
- Las sesiones usan cookie `HttpOnly` y `SameSite=Lax`.
- El servidor solo publica `index.html`, `styles.css` y `app.js`; no expone `.env`, `server.js` ni `data/db.json`.
- Hay limite de intentos para registro y login.
- Las cuentas nuevas entran directo despues del registro.

## IA

El endpoint `/api/ai/tutor` usa Groq con su API compatible con OpenAI Chat Completions. Si no configuras `GROQ_API_KEY`, la app usa respuestas locales de respaldo para que siga funcionando.

Documentacion oficial de Groq:

- [API reference](https://console.groq.com/docs/api-reference)
- [Overview](https://console.groq.com/docs)
