const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const AREAS = [
  {
    id: "normativa",
    name: "Aspectos normativos",
    sub: "Derechos NNA, interes superior, inclusion y bases legales de la NEM.",
    color: "#167a58",
  },
  {
    id: "intervencion",
    name: "Intervencion docente",
    sub: "Planeacion, evaluacion formativa, diversidad, programa analitico y aula.",
    color: "#315f9c",
  },
  {
    id: "comunidad",
    name: "Escuela y comunidad",
    sub: "Trabajo colegiado, CTE, mejora continua, familias y contexto.",
    color: "#b7791f",
  },
];

const PROFILES = {
  primaria: "Primaria",
  preescolar: "Preescolar",
  secundaria: "Secundaria",
  especial: "Educacion especial",
  ef: "Educacion fisica",
  telesecundaria: "Telesecundaria",
};

const TOPICS = [
  ["normativa", "Articulo 3 constitucional", "Base legal del derecho a la educacion y sus principios."],
  ["normativa", "Ley General de Educacion", "Fines, criterios, equidad, inclusion y excelencia."],
  ["normativa", "Derechos de NNA", "Interes superior, no discriminacion, proteccion y participacion."],
  ["normativa", "Nueva Escuela Mexicana", "Principios, comunidad, humanismo, interculturalidad e inclusion."],
  ["intervencion", "Plan de Estudio 2022", "Campos formativos, ejes articuladores y fases."],
  ["intervencion", "Programa analitico", "Lectura de contexto, codiseno y articulacion curricular."],
  ["intervencion", "Planeacion didactica", "Proposito, actividades, recursos, evaluacion y ajustes."],
  ["intervencion", "Evaluacion formativa", "Evidencias, retroalimentacion y mejora durante el proceso."],
  ["comunidad", "Consejo Tecnico Escolar", "Analisis colegiado, acuerdos y seguimiento de mejora."],
  ["comunidad", "Mejora continua", "Diagnostico, prioridades, acciones, seguimiento y evaluacion."],
  ["comunidad", "Escuela y familias", "Comunicacion, corresponsabilidad y apoyo al aprendizaje."],
  ["comunidad", "Contextualizacion", "Vinculo entre saberes escolares, territorio y comunidad."],
];

const BASE_QUESTIONS = [
  {
    area: "normativa",
    format: "Cuestionamiento directo",
    q: "Una docente detecta que una alumna con discapacidad no participa en actividades grupales porque el material no es accesible. Que principio debe orientar primero su decision?",
    options: ["Seleccionar otra actividad para la alumna", "Garantizar inclusion y no discriminacion", "Esperar indicaciones administrativas"],
    answer: 1,
    why: "La respuesta prioriza el derecho a aprender en igualdad de condiciones y elimina barreras para la participacion.",
  },
  {
    area: "normativa",
    format: "Completamiento",
    q: "El interes superior de la niñez implica que, ante una decision escolar, se debe priorizar ____.",
    options: ["la comodidad operativa del plantel", "el bienestar y desarrollo integral de NNA", "la opinion de la mayoria adulta"],
    answer: 1,
    why: "El criterio central es proteger derechos, bienestar y desarrollo integral de niñas, niños y adolescentes.",
  },
  {
    area: "normativa",
    format: "Relacion de elementos",
    q: "Relaciona el enfoque de la NEM con la practica docente mas congruente.",
    options: ["Humanismo: clasificar alumnos por rendimiento", "Comunidad: vincular contenidos con problemas del entorno", "Inclusion: aplicar una unica estrategia para todos"],
    answer: 1,
    why: "La NEM coloca a la comunidad como nucleo integrador del aprendizaje situado.",
  },
  {
    area: "normativa",
    format: "Cuestionamiento directo",
    q: "Cual accion es mas congruente con el derecho a la educacion?",
    options: ["Adaptar apoyos para asegurar permanencia", "Suspender evaluacion a quien aprende distinto", "Reducir expectativas academicas por contexto"],
    answer: 0,
    why: "Garantizar permanencia y aprendizaje exige apoyos razonables, no exclusion ni bajas expectativas.",
  },
  {
    area: "intervencion",
    format: "Ordenamiento",
    q: "Ordena una secuencia logica de planeacion didactica.",
    options: ["Diagnostico, proposito, actividades, evaluacion", "Evaluacion, actividades, diagnostico, proposito", "Actividades, proposito, evaluacion, diagnostico"],
    answer: 0,
    why: "Primero se reconoce el punto de partida; despues se define el sentido, se actua y se valora.",
  },
  {
    area: "intervencion",
    format: "Cuestionamiento directo",
    q: "Durante una actividad varios alumnos muestran errores similares. Que accion representa evaluacion formativa?",
    options: ["Registrar la calificacion y cerrar el tema", "Retroalimentar y ajustar la estrategia", "Aplicar una sancion por bajo desempeño"],
    answer: 1,
    why: "La evaluacion formativa usa evidencia para mejorar la enseñanza y el aprendizaje durante el proceso.",
  },
  {
    area: "intervencion",
    format: "Completamiento",
    q: "El programa analitico se construye considerando el plan de estudio, el contexto y ____.",
    options: ["el codiseno docente", "la memorizacion de contenidos", "la eliminacion del diagnostico"],
    answer: 0,
    why: "El codiseno permite contextualizar contenidos y procesos desde la escuela.",
  },
  {
    area: "intervencion",
    format: "Relacion de elementos",
    q: "Que relacion es correcta en el Plan de Estudio 2022?",
    options: ["Ejes articuladores: organizan grados administrativos", "Campos formativos: agrupan saberes y experiencias", "Fases: sustituyen toda planeacion docente"],
    answer: 1,
    why: "Los campos formativos articulan saberes para abordar la realidad de manera integrada.",
  },
  {
    area: "comunidad",
    format: "Cuestionamiento directo",
    q: "El CTE revisa altos niveles de inasistencia. Que accion favorece la mejora continua?",
    options: ["Definir causas, acciones, responsables y seguimiento", "Esperar el siguiente ciclo escolar", "Publicar una lista de alumnos con faltas"],
    answer: 0,
    why: "La mejora continua requiere diagnostico, acuerdos, implementacion y seguimiento colegiado.",
  },
  {
    area: "comunidad",
    format: "Completamiento",
    q: "La relacion escuela-comunidad fortalece el aprendizaje cuando ____.",
    options: ["se usan problemas del entorno como situaciones de aprendizaje", "la escuela evita dialogar con familias", "se separa el aula de la vida cotidiana"],
    answer: 0,
    why: "El aprendizaje situado conecta contenidos escolares con experiencias y necesidades reales.",
  },
  {
    area: "comunidad",
    format: "Ordenamiento",
    q: "Ordena un ciclo de mejora escolar.",
    options: ["Diagnostico, prioridad, accion, seguimiento", "Accion, cierre, diagnostico, prioridad", "Seguimiento, prioridad, accion, diagnostico"],
    answer: 0,
    why: "La escuela mejora cuando identifica necesidades, prioriza, actua y verifica avances.",
  },
  {
    area: "comunidad",
    format: "Relacion de elementos",
    q: "Selecciona la practica que expresa trabajo colaborativo escuela-familia.",
    options: ["Informar resultados sin escuchar a nadie", "Construir acuerdos de apoyo al aprendizaje", "Delegar toda responsabilidad a madres y padres"],
    answer: 1,
    why: "La corresponsabilidad implica dialogo, acuerdos y seguimiento compartido.",
  },
];

const LIBRARY = [
  {
    title: "Guia USICAMM Admisión Educación Básica 2026-2027",
    desc: "Estructura del instrumento, areas, subareas, formatos de reactivos y proceso de aplicacion.",
    url: "https://usicamm.sep.gob.mx/usicamm_dsk08/2026-2027/compilacion/EB/GUIAS/Guia_admision_tecnologias.pdf",
    tags: ["guia", "90 reactivos", "admision"],
  },
  {
    title: "Acuerdo de admisión Educación Básica",
    desc: "Elementos multifactoriales: formacion, promedio, cursos, experiencia y apreciacion.",
    url: "https://usicamm.sep.gob.mx/usicamm_dsk08/2025-2026/compilacion/EB/Acuerdo_Admision_EB.pdf",
    tags: ["puntaje", "multifactorial"],
  },
  {
    title: "Portal oficial USICAMM",
    desc: "Convocatorias, procesos, avisos y enlaces oficiales por entidad federativa.",
    url: "https://usicamm.sep.gob.mx/",
    tags: ["oficial", "convocatorias"],
  },
  {
    title: "Plan de Estudio 2022",
    desc: "Campos formativos, ejes articuladores, fases y enfoque curricular de la NEM.",
    url: "https://www.sep.gob.mx/",
    tags: ["NEM", "curriculo"],
  },
  {
    title: "Consejo Tecnico Escolar",
    desc: "Materiales de trabajo colegiado, planeacion didactica y programa analitico.",
    url: "https://educacionbasica.sep.gob.mx/",
    tags: ["CTE", "mejora"],
  },
  {
    title: "Ley General de los Derechos de Niñas, Niños y Adolescentes",
    desc: "Marco para interes superior, proteccion, inclusion, igualdad y participacion.",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGDNNA.pdf",
    tags: ["NNA", "derechos"],
  },
];

let currentUser = null;
let state = defaultClientState();
let simulatorTimer = null;
let simulatorStartedAt = 0;
let saveTimer = null;
let pendingVerification = null;

const HELP_TEXT = {
  dashboard: {
    label: "Inicio",
    body: "Aqui ves tu avance general, tu area mas debil y la siguiente accion recomendada. Si es tu primera vez, empieza con Diagnostico.",
  },
  diagnostico: {
    label: "Diagnostico",
    body: "Responde sin buscar la respuesta. La app usa tus aciertos y errores para ordenar tu ruta de estudio.",
  },
  ruta: {
    label: "Ruta",
    body: "Completa un tema por bloque. Los temas se ordenan dando prioridad a tus areas debiles.",
  },
  simulador: {
    label: "Simulador",
    body: "Usalo cuando ya tengas base. Practica con tiempo y revisa la retroalimentacion despues de cada error.",
  },
  tutor: {
    label: "Tutor IA",
    body: "Pide explicaciones, reactivos, resumenes o planes. La IA usa tu progreso para responder con mas contexto.",
  },
  biblioteca: {
    label: "Biblioteca",
    body: "Busca fuentes y temas oficiales. Es el lugar para verificar conceptos antes de memorizar.",
  },
};

function defaultClientState() {
  return {
    profile: "primaria",
    days: 45,
    answers: {},
    completedTopics: [],
    chat: [],
  };
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    api("/api/state", { method: "PUT", body: state }).catch((error) => {
      console.error(error);
    });
  }, 250);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: options.body ? { "content-type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  let data = {};
  if (contentType.includes("application/json")) {
    data = raw ? JSON.parse(raw) : {};
  } else {
    const preview = raw.trim().slice(0, 80);
    throw new Error(
      preview.startsWith("<!DOCTYPE")
        ? "El servidor devolvio HTML en vez de JSON. Inicia la app con pnpm start desde la carpeta del proyecto y recarga con Ctrl + F5."
        : `Respuesta inesperada del servidor: ${preview || response.status}`,
    );
  }
  if (!response.ok) {
    const error = new Error(data.error || "No se pudo completar la solicitud.");
    error.payload = data;
    throw error;
  }
  return data;
}

function applySession(payload) {
  currentUser = payload.user;
  state = { ...defaultClientState(), ...payload.state };
  $("#userName").textContent = currentUser.name;
  $("#authScreen").classList.remove("active");
  document.body.classList.remove("locked");
  renderDashboard();
}

function showAuth(message = "") {
  $("#authError").textContent = message;
  $("#authScreen").classList.add("active");
  document.body.classList.add("locked");
}

function showAuthTab(tab) {
  $$("[data-auth-tab]").forEach((item) => item.classList.toggle("active", item.dataset.authTab === tab));
  $$(".auth-form").forEach((form) => form.classList.toggle("active", form.id === `${tab}Form`));
  $("#authError").textContent = "";
}

function showVerification(payload) {
  pendingVerification = payload;
  showAuthTab("verify");
  $("#verifyTarget").textContent = `Codigo enviado por email a ${payload.contact}.`;
  $("#authError").textContent = "";
  $("#authScreen").classList.add("active");
  document.body.classList.add("locked");
}

function scoreByArea() {
  const totals = Object.fromEntries(AREAS.map((area) => [area.id, { ok: 0, total: 0 }]));
  Object.values(state.answers).forEach((answer) => {
    totals[answer.area].total += 1;
    if (answer.correct) totals[answer.area].ok += 1;
  });
  return Object.fromEntries(
    Object.entries(totals).map(([id, value]) => [id, value.total ? Math.round((value.ok / value.total) * 100) : 0]),
  );
}

function readiness() {
  const scores = scoreByArea();
  const quizScore = Math.round(AREAS.reduce((sum, area) => sum + scores[area.id], 0) / AREAS.length);
  const topicScore = Math.round((state.completedTopics.length / TOPICS.length) * 100);
  return Math.round(quizScore * 0.7 + topicScore * 0.3);
}

function makeQuestions(count, seed = "diagnostic") {
  const profile = PROFILES[state.profile];
  return Array.from({ length: count }, (_, index) => {
    const base = BASE_QUESTIONS[(index * 5 + seed.length) % BASE_QUESTIONS.length];
    const topic = TOPICS.find((item) => item[0] === base.area)?.[1] || "USICAMM";
    return {
      ...base,
      id: `${seed}-${index}-${base.area}`,
      q: `${base.q} (${profile})`,
      topic,
    };
  });
}

function renderQuiz(container, questions, mode) {
  container.innerHTML = "";
  questions.forEach((question, index) => {
    const node = $("#questionTemplate").content.firstElementChild.cloneNode(true);
    $(".question-meta", node).textContent = `${index + 1}. ${question.format} · ${areaName(question.area)} · ${question.topic}`;
    $("h3", node).textContent = question.q;
    const options = $(".options", node);

    question.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.className = "option-button";
      button.type = "button";
      button.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
      button.addEventListener("click", () => answerQuestion(question, optionIndex, node, mode));
      options.append(button);
    });

    container.append(node);
  });
}

function answerQuestion(question, optionIndex, node, mode) {
  const correct = optionIndex === question.answer;
  state.answers[`${mode}-${question.id}`] = { area: question.area, correct };
  saveState();

  $$(".option-button", node).forEach((button, index) => {
    button.disabled = true;
    button.classList.toggle("correct", index === question.answer);
    button.classList.toggle("wrong", index === optionIndex && !correct);
  });

  $(".feedback", node).textContent = correct ? `Correcto. ${question.why}` : `Revisa: ${question.why}`;
  updateDashboard();
}

function areaName(id) {
  return AREAS.find((area) => area.id === id)?.name || id;
}

function renderDashboard() {
  $("#profileSelect").value = state.profile;
  $("#daysInput").value = state.days;
  renderAreaProgress();
  renderRoute();
  renderLibrary();
  renderChat();
  renderQuiz($("#diagnosticQuiz"), makeQuestions(20), "diagnostic");
  updateDashboard();
}

function updateDashboard() {
  const value = readiness();
  $("#readiness").textContent = `${value}%`;
  $("#readinessCopy").textContent =
    value < 40 ? "Buen momento para construir base normativa y pedagogica." : value < 75 ? "Ya hay avance: enfoca tus areas debiles." : "Vas fuerte: practica con simulador completo.";
  $("#goalBar").style.width = `${Math.min(100, Object.keys(state.answers).length * 6)}%`;

  const weakest = weakestArea();
  $("#nextActionTitle").textContent = weakest ? `Refuerza ${areaName(weakest)}` : "Haz tu diagnostico";
  $("#nextActionText").textContent = weakest
    ? AREAS.find((area) => area.id === weakest).sub
    : "Responde las primeras preguntas para activar recomendaciones.";

  renderAreaProgress();
  drawStudyMap();
}

function renderAreaProgress() {
  const scores = scoreByArea();
  $("#areaProgress").innerHTML = AREAS.map(
    (area) => `
      <article class="area-card">
        <header><strong>${area.name}</strong><span>${scores[area.id]}%</span></header>
        <p>${area.sub}</p>
        <div class="progress-track" aria-hidden="true"><i style="width:${scores[area.id]}%; background:${area.color}"></i></div>
      </article>
    `,
  ).join("");
}

function weakestArea() {
  const scores = scoreByArea();
  if (!Object.keys(state.answers).length) return null;
  return AREAS.map((area) => area.id).sort((a, b) => scores[a] - scores[b])[0];
}

function renderRoute() {
  const scores = scoreByArea();
  const ordered = [...TOPICS].sort((a, b) => scores[a[0]] - scores[b[0]]);
  $("#routeTitle").textContent = `Ruta para ${PROFILES[state.profile]} en ${state.days} dias`;
  $("#routeGrid").innerHTML = ordered
    .map(([area, title, desc], index) => {
      const done = state.completedTopics.includes(title);
      return `
        <article class="route-card ${done ? "done" : ""}">
          <span class="badge">Dia ${Math.min(state.days, index + 1)} · ${areaName(area)}</span>
          <header><strong>${title}</strong><span>${done ? "Completado" : "Pendiente"}</span></header>
          <p>${desc}</p>
          <button class="${done ? "ghost-button" : "primary-button"}" data-topic="${title}" type="button">
            ${done ? "Marcar pendiente" : "Completar tema"}
          </button>
        </article>
      `;
    })
    .join("");
}

function renderLibrary(term = "") {
  const needle = term.trim().toLowerCase();
  const rows = LIBRARY.filter((item) => `${item.title} ${item.desc} ${item.tags.join(" ")}`.toLowerCase().includes(needle));
  $("#libraryGrid").innerHTML = rows
    .map(
      (item) => `
        <article class="source-card">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <a href="${item.url}" target="_blank" rel="noreferrer">Abrir fuente</a>
          <div class="source-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        </article>
      `,
    )
    .join("");
}

function renderChat() {
  if (!state.chat.length) {
    state.chat.push({
      role: "ai",
      text: "Hola. Soy tu tutor IA para USICAMM. Puedo crear reactivos, explicar temas, analizar errores y armar planes segun tu avance.",
    });
  }
  $("#chatLog").innerHTML = "";
  state.chat.forEach((msg) => {
    const item = document.createElement("div");
    item.className = `message ${msg.role}`;
    item.innerHTML = formatMessage(msg.text);
    $("#chatLog").append(item);
  });
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function formatMessage(text) {
  return String(text)
    .replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char])
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function tutorReply(prompt) {
  const text = prompt.toLowerCase();
  const weak = weakestArea();
  if (text.includes("pregunta") || text.includes("reactivo")) {
    const area = text.includes("norm") ? "normativa" : text.includes("comunidad") ? "comunidad" : weak || "intervencion";
    const sample = BASE_QUESTIONS.filter((q) => q.area === area).slice(0, 5);
    return sample
      .map((q, index) => `${index + 1}. ${q.q}\nRespuesta: ${q.options[q.answer]}. ${q.why}`)
      .join("\n\n");
  }
  if (text.includes("hoy") || text.includes("avance")) {
    const area = weak || "normativa";
    const topic = TOPICS.find((item) => item[0] === area && !state.completedTopics.includes(item[1])) || TOPICS.find((item) => item[0] === area);
    return `Hoy conviene estudiar ${topic[1]}. Despues haz 15 reactivos de ${areaName(area)} y revisa tus errores antes de pasar al siguiente tema.`;
  }
  if (text.includes("evaluacion")) {
    return "La evaluacion formativa usa evidencias durante el aprendizaje para retroalimentar, ajustar la enseñanza y ayudar al alumno a mejorar. Ejemplo: si varios estudiantes fallan al resolver un problema, no solo se califica; se identifica el error, se modela otra estrategia y se vuelve a practicar.";
  }
  if (text.includes("nem") || text.includes("nueva escuela")) {
    return "La Nueva Escuela Mexicana pone al centro el derecho a la educacion, la inclusion, el humanismo, la comunidad, la interculturalidad y el aprendizaje situado. Para el examen, conectala con decisiones docentes: eliminar barreras, contextualizar contenidos y trabajar con familias/comunidad.";
  }
  if (text.includes("plan") || text.includes("programa analitico")) {
    return "El programa analitico contextualiza el Plan de Estudio 2022 en la escuela. Parte de la lectura de la realidad, recupera necesidades del grupo y organiza contenidos, ejes y actividades mediante codiseno docente.";
  }
  return "Para USICAMM, responde siempre pensando en derechos de NNA, inclusion, evaluacion formativa, trabajo colegiado y contexto. Si una opcion excluye, castiga o ignora el diagnostico, casi siempre es distractor.";
}

function detectAiMode(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes("reactivo") || text.includes("pregunta") || text.includes("quiz")) return "questions";
  if (text.includes("plan") || text.includes("rut") || text.includes("dias") || text.includes("semana")) return "plan";
  if (text.includes("error") || text.includes("fall")) return "review";
  if (text.includes("resume") || text.includes("explica")) return "explain";
  return "chat";
}

async function askTutor(prompt) {
  const status = $("#aiStatus");
  status.textContent = "Pensando con tu progreso...";
  status.className = "ai-status loading";
  try {
    const payload = await api("/api/ai/tutor", {
      method: "POST",
      body: { prompt, mode: detectAiMode(prompt) },
    });
    status.textContent = payload.source === "api" ? "Respuesta generada con tu API key." : "Modo local: agrega tu API key para IA real.";
    status.className = payload.source === "api" ? "ai-status ready" : "ai-status error";
    return payload.text;
  } catch (error) {
    status.textContent = "No pude conectar con la IA; use respaldo local.";
    status.className = "ai-status error";
    return tutorReply(prompt);
  }
}

function startSimulator() {
  $("#simulatorIntro").classList.add("hidden");
  $("#simulatorQuiz").classList.remove("hidden");
  renderQuiz($("#simulatorQuiz"), makeQuestions(90, "simulator"), "simulator");
  simulatorStartedAt = Date.now();
  clearInterval(simulatorTimer);
  simulatorTimer = setInterval(() => {
    const seconds = Math.floor((Date.now() - simulatorStartedAt) / 1000);
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    $("#timer").textContent = `${min}:${sec}`;
  }, 1000);
}

function drawStudyMap() {
  const canvas = $("#studyMap");
  const ctx = canvas.getContext("2d");
  const scores = scoreByArea();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 3;
  ctx.font = "700 15px Segoe UI";

  const nodes = [
    { x: 110, y: 90, area: AREAS[0] },
    { x: 340, y: 80, area: AREAS[1] },
    { x: 250, y: 235, area: AREAS[2] },
  ];
  ctx.strokeStyle = "#d9e2dc";
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  ctx.lineTo(nodes[1].x, nodes[1].y);
  ctx.lineTo(nodes[2].x, nodes[2].y);
  ctx.closePath();
  ctx.stroke();

  nodes.forEach(({ x, y, area }) => {
    const radius = 34 + scores[area.id] * 0.26;
    ctx.beginPath();
    ctx.fillStyle = area.color;
    ctx.globalAlpha = 0.18;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.fillStyle = area.color;
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`${scores[area.id]}%`, x, y + 5);
    ctx.fillStyle = "#17201b";
    ctx.fillText(area.name.split(" ")[0], x, y + radius + 24);
  });
}

function bindEvents() {
  $$("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      showAuthTab(button.dataset.authTab);
    });
  });

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const payload = await api("/api/login", {
        method: "POST",
        body: { email: form.get("email"), password: form.get("password") },
      });
      applySession(payload);
    } catch (error) {
      if (error.payload?.requiresVerification) {
        showVerification(error.payload);
      } else {
        showAuth(error.message);
      }
    }
  });

  $("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const payload = await api("/api/register", {
        method: "POST",
        body: {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          verificationChannel: "email",
          profile: form.get("profile"),
        },
      });
      if (payload.requiresVerification) {
        showVerification(payload);
      } else {
        applySession(payload);
      }
    } catch (error) {
      showAuth(error.message);
    }
  });

  $("#verifyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!pendingVerification?.userId) {
      showAuth("Primero crea una cuenta o inicia sesion.");
      return;
    }
    try {
      const payload = await api("/api/verify", {
        method: "POST",
        body: { userId: pendingVerification.userId, code: form.get("code") },
      });
      pendingVerification = null;
      applySession(payload);
    } catch (error) {
      $("#authError").textContent = error.message;
    }
  });

  $("#resendCode").addEventListener("click", async () => {
    if (!pendingVerification?.userId) return;
    try {
      const payload = await api("/api/resend-verification", {
        method: "POST",
        body: { userId: pendingVerification.userId },
      });
      showVerification(payload);
    } catch (error) {
      $("#authError").textContent = error.message;
    }
  });

  $("#logoutButton").addEventListener("click", async () => {
    await api("/api/logout", { method: "POST" }).catch(() => {});
    currentUser = null;
    state = defaultClientState();
    showAuth();
  });

  $$(".nav-item").forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });
  $$("[data-jump]").forEach((item) => item.addEventListener("click", () => switchView(item.dataset.jump)));

  $("#profileSelect").addEventListener("change", (event) => {
    state.profile = event.target.value;
    saveState();
    renderDashboard();
  });
  $("#daysInput").addEventListener("input", (event) => {
    state.days = Number(event.target.value || 1);
    saveState();
    renderRoute();
  });
  $("#newDiagnostic").addEventListener("click", () => renderQuiz($("#diagnosticQuiz"), makeQuestions(20, String(Date.now())), "diagnostic"));
  $("#generatePlan").addEventListener("click", renderRoute);
  $("#startSimulator").addEventListener("click", startSimulator);
  $("#librarySearch").addEventListener("input", (event) => renderLibrary(event.target.value));
  $("#routeGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    const topic = button.dataset.topic;
    state.completedTopics = state.completedTopics.includes(topic)
      ? state.completedTopics.filter((item) => item !== topic)
      : [...state.completedTopics, topic];
    saveState();
    renderRoute();
    updateDashboard();
  });
  $("[data-action='resetProgress']").addEventListener("click", () => {
    state.answers = {};
    state.completedTopics = [];
    saveState();
    renderDashboard();
  });
  $("#chatForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = $("#chatInput").value.trim();
    if (!prompt) return;
    state.chat.push({ role: "user", text: prompt });
    $("#chatInput").value = "";
    renderChat();
    const answer = await askTutor(prompt);
    state.chat.push({ role: "ai", text: answer });
    saveState();
    renderChat();
  });
  $$(".prompt-bank button").forEach((button) => {
    button.addEventListener("click", () => {
      $("#chatInput").value = button.dataset.prompt;
      $("#chatForm").requestSubmit();
    });
  });

  $("#helpLauncher").addEventListener("click", () => {
    $("#helpDrawer").classList.add("open");
    updateHelp($(".view.active")?.id || "dashboard");
  });
  $("#closeHelp").addEventListener("click", () => $("#helpDrawer").classList.remove("open"));
  $("#helpQuestionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const question = $("#helpQuestionInput").value.trim();
    const answer = answerNavigationQuestion(question);
    $("#helpAnswer").textContent = answer.text;
    if (answer.view) switchView(answer.view);
  });
  $$("[data-help-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      switchView(button.dataset.helpJump);
      updateHelp(button.dataset.helpJump);
    });
  });
}

function switchView(id) {
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === id));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === id));
  updateHelp(id);
}

function updateHelp(id) {
  const help = HELP_TEXT[id] || HELP_TEXT.dashboard;
  $("#helpViewLabel").textContent = help.label;
  $("#helpBody").innerHTML = `<p>${help.body}</p><p>Tip: usa los atajos del tutor cuando no sepas que pedir.</p>`;
}

function answerNavigationQuestion(question) {
  const text = question.toLowerCase();
  if (text.includes("simul")) return { view: "simulador", text: "Te llevo al simulador. Ahi puedes iniciar una prueba tipo USICAMM." };
  if (text.includes("diagn")) return { view: "diagnostico", text: "Te llevo al diagnostico. Empieza aqui si aun no sabes tu nivel." };
  if (text.includes("ruta") || text.includes("plan")) return { view: "ruta", text: "Te llevo a la ruta. Ahi ves que estudiar por prioridad." };
  if (text.includes("ia") || text.includes("tutor") || text.includes("pregunta")) return { view: "tutor", text: "Te llevo al tutor IA. Puedes pedir explicaciones, reactivos o resumenes." };
  if (text.includes("fuente") || text.includes("bibli") || text.includes("guia")) return { view: "biblioteca", text: "Te llevo a biblioteca. Ahi estan las fuentes y temas oficiales." };
  return { view: null, text: "Puedo llevarte a diagnostico, ruta, simulador, tutor IA o biblioteca. Escribe una de esas palabras." };
}

async function init() {
  bindEvents();
  try {
    const payload = await api("/api/me");
    applySession(payload);
  } catch {
    showAuth();
    renderDashboard();
  }
}

init();
