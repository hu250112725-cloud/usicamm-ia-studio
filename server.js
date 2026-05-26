const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

loadEnv();

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PUBLIC_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};
const PUBLIC_FILES = new Set(["/index.html", "/styles.css", "/app.js"]);
const LOGIN_ATTEMPTS = new Map();

const AI_MODEL = process.env.GROQ_MODEL || process.env.OPENAI_MODEL || "llama-3.1-8b-instant";
const AI_BASE_URL = (process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  });
}

function emptyDb() {
  return { users: [], sessions: [], states: {}, verifications: [] };
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb(), null, 2));
}

function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  db.users ||= [];
  db.sessions ||= [];
  db.states ||= {};
  db.verifications ||= [];
  return db;
}

function writeDb(db) {
  ensureDb();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(tempFile, DB_FILE);
  try {
    fs.chmodSync(DB_FILE, 0o600);
  } catch {
    // Windows permissions are handled by the user profile ACL.
  }
}

function json(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "same-origin",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter((pair) => pair.length === 2)
      .map(([key, value]) => [key, decodeURIComponent(value)]),
  );
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON invalido"));
      }
    });
  });
}

function clientKey(req, purpose) {
  return `${purpose}:${req.socket.remoteAddress || "local"}`;
}

function checkRateLimit(req, purpose, max = 8, windowMs = 1000 * 60 * 10) {
  const key = clientKey(req, purpose);
  const now = Date.now();
  const bucket = (LOGIN_ATTEMPTS.get(key) || []).filter((time) => now - time < windowMs);
  if (bucket.length >= max) return false;
  bucket.push(now);
  LOGIN_ATTEMPTS.set(key, bucket);
  return true;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const test = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    verificationChannel: "email",
    verifiedAt: user.verifiedAt || null,
    profile: user.profile,
    createdAt: user.createdAt,
  };
}

function verificationContact(user) {
  return user.email;
}

function maskContact(contact = "") {
  if (contact.includes("@")) {
    const [name, domain] = contact.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return contact.replace(/\d(?=\d{2})/g, "*");
}

function makeCode() {
  return String(crypto.randomInt(100000, 999999));
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function createVerification(db, user) {
  const code = makeCode();
  db.verifications = db.verifications.filter((item) => item.userId !== user.id);
  db.verifications.push({
    userId: user.id,
    channel: "email",
    contact: verificationContact(user),
    codeHash: hashCode(code),
    attempts: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
  });
  return code;
}

function verificationPayload(user, code) {
  return {
    requiresVerification: true,
    userId: user.id,
    channel: "email",
    contact: maskContact(verificationContact(user)),
  };
}

async function sendVerificationCode(user, code) {
  return sendEmailCode(user.email, code);
}

async function sendEmailCode(email, code) {
  if (process.env.EMAIL_PROVIDER !== "resend" || !process.env.RESEND_API_KEY) {
    throw new Error("Configura EMAIL_PROVIDER=resend y RESEND_API_KEY para enviar codigos reales por email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "USICAMM IA <onboarding@resend.dev>",
      to: [email],
      subject: "Tu codigo de confirmacion USICAMM IA",
      html: `<p>Tu codigo de confirmacion es:</p><h1>${code}</h1><p>Vence en 10 minutos.</p>`,
      text: `Tu codigo de confirmacion USICAMM IA es ${code}. Vence en 10 minutos.`,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "No se pudo enviar el email de confirmacion.");
  return { provider: "resend" };
}

function isVerified(user) {
  return Boolean(user.verifiedAt);
}

function defaultState(profile = "primaria") {
  return {
    profile,
    days: 45,
    answers: {},
    completedTopics: [],
    chat: [],
    updatedAt: new Date().toISOString(),
  };
}

function studySnapshot(user, state) {
  const totals = {
    normativa: { ok: 0, total: 0 },
    intervencion: { ok: 0, total: 0 },
    comunidad: { ok: 0, total: 0 },
  };
  Object.values(state.answers || {}).forEach((answer) => {
    if (!totals[answer.area]) return;
    totals[answer.area].total += 1;
    if (answer.correct) totals[answer.area].ok += 1;
  });
  const scores = Object.fromEntries(
    Object.entries(totals).map(([area, value]) => [area, value.total ? Math.round((value.ok / value.total) * 100) : 0]),
  );
  return {
    estudiante: user.name,
    perfil: state.profile || user.profile,
    diasParaExamen: state.days,
    temasCompletados: state.completedTopics || [],
    puntajesPorArea: scores,
    reactivosRespondidos: Object.keys(state.answers || {}).length,
  };
}

function localAiFallback(prompt, snapshot, mode) {
  if (mode === "questions") {
    return [
      "Aqui tienes 5 reactivos tipo USICAMM:",
      "",
      "1. Que accion representa inclusion educativa?",
      "A) Separar al alumno con rezago. B) Ajustar apoyos para que participe. C) Reducir expectativas.",
      "Respuesta: B. La inclusion elimina barreras de participacion y aprendizaje.",
      "",
      "2. Que hace la evaluacion formativa?",
      "A) Solo asigna calificacion. B) Retroalimenta y ajusta la enseñanza. C) Sustituye la planeacion.",
      "Respuesta: B. Usa evidencias para mejorar durante el proceso.",
    ].join("\n");
  }
  if (mode === "plan") {
    return `Plan sugerido para ${snapshot.perfil}: estudia primero el area con menor avance, completa un tema por dia y responde 15 reactivos diarios. Hoy empieza con Nueva Escuela Mexicana, despues evaluacion formativa y cierra con CTE/mejora continua.`;
  }
  return "No hay API key configurada, asi que estoy usando modo local. Para estudiar USICAMM, prioriza derechos de NNA, inclusion, NEM, planeacion didactica, evaluacion formativa, CTE y vinculo escuela-comunidad.";
}

function aiSystemPrompt(snapshot, mode) {
  return [
    "Eres un tutor experto para preparar docentes mexicanos para USICAMM.",
    "Responde en espanol claro, directo y util para estudiar.",
    "Usa el enfoque de admision a Educacion Basica: aspectos normativos, intervencion docente, escuela y comunidad.",
    "Cuando generes reactivos, usa 3 opciones, una respuesta correcta y explicacion breve.",
    "No inventes citas legales exactas. Si no estas seguro, dilo y recomienda revisar la fuente oficial.",
    "Personaliza con este avance del estudiante:",
    JSON.stringify(snapshot),
    `Modo solicitado: ${mode}.`,
  ].join("\n");
}

async function askAi({ prompt, snapshot, mode }) {
  const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!key || key === "pon_tu_groq_api_key_aqui" || key === "pon_tu_api_key_aqui") {
    return { text: localAiFallback(prompt, snapshot, mode), source: "local" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: mode === "questions" ? 0.7 : 0.35,
      messages: [
        { role: "system", content: aiSystemPrompt(snapshot, mode) },
        { role: "user", content: prompt },
      ],
    }),
  }).finally(() => clearTimeout(timeout));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "La IA no respondio correctamente.");
  }
  return { text: data.choices?.[0]?.message?.content || "No recibi respuesta de la IA.", source: "api" };
}

function auth(req, db) {
  const token = parseCookies(req).usicamm_session;
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token && new Date(item.expiresAt) > new Date());
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

async function handleApi(req, res) {
  const db = readDb();
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "POST" && url.pathname === "/api/register") {
      if (!checkRateLimit(req, "register", 5)) return json(res, 429, { error: "Demasiados intentos. Espera unos minutos." });
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const name = String(body.name || "").trim();
      const password = String(body.password || "");
      const profile = String(body.profile || "primaria");
      const verificationChannel = "email";

      if (password.length > 0 && password.length < 8) return json(res, 400, { error: "La contrasena debe tener al menos 8 caracteres." });
      if (!name || !email || !password) return json(res, 400, { error: "Nombre, correo y contraseña son obligatorios." });
      if (password.length < 6) return json(res, 400, { error: "La contraseña debe tener al menos 6 caracteres." });
      if (db.users.some((user) => user.email === email)) return json(res, 409, { error: "Ese correo ya esta registrado." });

      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        profile,
        verificationChannel,
        verifiedAt: null,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      db.states[user.id] = defaultState(profile);
      const code = createVerification(db, user);
      const delivery = await sendVerificationCode(user, code);
      writeDb(db);
      return json(res, 201, { ...verificationPayload(user, code), ...delivery });
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      if (!checkRateLimit(req, "login", 10)) return json(res, 429, { error: "Demasiados intentos. Espera unos minutos." });
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = db.users.find((item) => item.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return json(res, 401, { error: "Correo o contraseña incorrectos." });
      }
      if (!isVerified(user)) {
        const code = createVerification(db, user);
        const delivery = await sendVerificationCode(user, code);
        writeDb(db);
        return json(res, 403, { error: "Confirma tu cuenta para entrar.", ...verificationPayload(user, code), ...delivery });
      }
      const token = crypto.randomBytes(32).toString("hex");
      db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), expiresAt: expiryDate() });
      db.states[user.id] ||= defaultState(user.profile);
      writeDb(db);
      return json(res, 200, { user: publicUser(user), state: db.states[user.id] }, sessionHeader(token));
    }

    if (req.method === "POST" && url.pathname === "/api/verify") {
      if (!checkRateLimit(req, "verify", 8)) return json(res, 429, { error: "Demasiados intentos. Espera unos minutos." });
      const body = await readBody(req);
      const userId = String(body.userId || "");
      const code = String(body.code || "").trim();
      const user = db.users.find((item) => item.id === userId);
      const verification = db.verifications.find((item) => item.userId === userId);
      if (!user || !verification) return json(res, 404, { error: "No encontre una verificacion pendiente." });
      if (new Date(verification.expiresAt) < new Date()) return json(res, 400, { error: "El codigo vencio. Pide uno nuevo." });
      if (verification.attempts >= 5) return json(res, 429, { error: "Codigo bloqueado por demasiados intentos. Pide uno nuevo." });
      verification.attempts += 1;
      if (verification.codeHash !== hashCode(code)) {
        writeDb(db);
        return json(res, 400, { error: "Codigo incorrecto." });
      }
      user.verifiedAt = new Date().toISOString();
      db.verifications = db.verifications.filter((item) => item.userId !== user.id);
      db.states[user.id] ||= defaultState(user.profile);
      const token = crypto.randomBytes(32).toString("hex");
      db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), expiresAt: expiryDate() });
      writeDb(db);
      return json(res, 200, { user: publicUser(user), state: db.states[user.id] }, sessionHeader(token));
    }

    if (req.method === "POST" && url.pathname === "/api/resend-verification") {
      if (!checkRateLimit(req, "resend", 4)) return json(res, 429, { error: "Espera antes de pedir otro codigo." });
      const body = await readBody(req);
      const userId = String(body.userId || "");
      const user = db.users.find((item) => item.id === userId);
      if (!user) return json(res, 404, { error: "Usuario no encontrado." });
      if (isVerified(user)) return json(res, 200, { ok: true });
      const code = createVerification(db, user);
      const delivery = await sendVerificationCode(user, code);
      writeDb(db);
      return json(res, 200, { ...verificationPayload(user, code), ...delivery });
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = parseCookies(req).usicamm_session;
      const next = { ...db, sessions: db.sessions.filter((item) => item.token !== token) };
      writeDb(next);
      return json(res, 200, { ok: true }, { "set-cookie": "usicamm_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
    }

    const user = auth(req, db);
    if (!user) return json(res, 401, { error: "Necesitas iniciar sesion." });

    if (req.method === "GET" && url.pathname === "/api/me") {
      db.states[user.id] ||= defaultState(user.profile);
      writeDb(db);
      return json(res, 200, { user: publicUser(user), state: db.states[user.id] });
    }

    if (req.method === "PUT" && url.pathname === "/api/state") {
      const body = await readBody(req);
      db.states[user.id] = {
        ...defaultState(user.profile),
        ...body,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return json(res, 200, { state: db.states[user.id] });
    }

    if (req.method === "POST" && url.pathname === "/api/ai/tutor") {
      const body = await readBody(req);
      const prompt = String(body.prompt || "").trim();
      const mode = String(body.mode || "chat");
      if (!prompt) return json(res, 400, { error: "Escribe una pregunta para la IA." });

      db.states[user.id] ||= defaultState(user.profile);
      const snapshot = studySnapshot(user, db.states[user.id]);
      const answer = await askAi({ prompt, snapshot, mode });
      return json(res, 200, answer);
    }

    return json(res, 404, { error: "Ruta API no encontrada." });
  } catch (error) {
    return json(res, 500, { error: error.message || "Error del servidor." });
  }
}

function expiryDate() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
}

function sessionHeader(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return {
    "set-cookie": `usicamm_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 14}${secure}`,
  };
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  if (!PUBLIC_FILES.has(requested)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff" });
    res.end("Not found");
    return;
  }
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "content-type": PUBLIC_TYPES[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "same-origin",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  ensureDb();
  console.log(`USICAMM IA Studio listo en http://localhost:${PORT}`);
});
