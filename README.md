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

La app crea automaticamente `data/db.json` para guardar usuarios, sesiones y progreso. Ese archivo esta ignorado por Git para no subir datos reales.

## Seguridad de cuentas

- Las contrasenas se guardan con hash `scrypt`.
- Las sesiones usan cookie `HttpOnly` y `SameSite=Lax`.
- El servidor solo publica `index.html`, `styles.css` y `app.js`; no expone `.env`, `server.js` ni `data/db.json`.
- Hay limite de intentos para registro, login y verificacion.
- Las cuentas nuevas deben confirmar un codigo por email.

La verificacion de cuenta usa email real con Resend. Define `NODE_ENV=production` y conecta Resend:

```env
NODE_ENV=production

EMAIL_PROVIDER=resend
RESEND_API_KEY=tu_api_key_de_resend
EMAIL_FROM=USICAMM IA <no-reply@tudominio.com>
```

Si no configuras Resend, la app devolvera un error y no confirmara cuentas de forma falsa.

## IA

El endpoint `/api/ai/tutor` usa Groq con su API compatible con OpenAI Chat Completions. Si no configuras `GROQ_API_KEY`, la app usa respuestas locales de respaldo para que siga funcionando.

Documentacion oficial de Groq:

- [API reference](https://console.groq.com/docs/api-reference)
- [Overview](https://console.groq.com/docs)
