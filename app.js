// Radar Gerencial — Musicala
// App estática conectada a Firebase Realtime Database.
// Pensada para Alek y Cata: cubrir todos los frentes de la empresa sin duplicarse ni dejar áreas en el limbo, ese deporte extremo administrativo.

const firebaseConfig = {
  apiKey: "AIzaSyA_ubaKFH-QTf2ckIjYkxr-OsLQK1sLfKg",
  authDomain: "cheklist-tareas-admin.firebaseapp.com",
  databaseURL: "https://cheklist-tareas-admin-default-rtdb.firebaseio.com",
  projectId: "cheklist-tareas-admin",
  storageBucket: "cheklist-tareas-admin.firebasestorage.app",
  messagingSenderId: "73174483631",
  appId: "1:73174483631:web:caa41ba359fbeb8d55ca5a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const db = firebase.database();

const PEOPLE = ["Alek", "Cata"];
const ALLOWED_USERS = Object.freeze({
  "alekcaballeromusic@gmail.com": "Alek",
  "catalina.medina.leal@gmail.com": "Cata"
});
const ROOT_PATH = "checklistCurrentV3_radarGerencial";
const HISTORY_PATH = "checklistHistoryV3_radarGerencial";
const AUDIT_COLLECTION = "checklistGerencialAudit";

const AREAS = [
  {
    title: "Dirección",
    emoji: "🧭",
    weight: 1,
    hint: "Prioridades, calendario, KPI, PQRS y decisiones urgentes.",
    tasks: [
      "Revisión de prioridades del día",
      "Seguimiento a indicadores clave (KPI's)",
      "Seguimiento de PQRS",
      "Aprobación de decisiones urgentes",
      "Revisión del Calendario Anual"
    ]
  },
  {
    title: "Contabilidad y Finanzas",
    emoji: "💰",
    weight: 2,
    hint: "Caja, pagos, ingresos, créditos y salud financiera.",
    tasks: [
      "Flujo de caja del día",
      "Pagos o ingresos registrados",
      "Plan financiero",
      "Cuentas por pagar y cobrar",
      "Solicitud de créditos y préstamos"
    ]
  },
  {
    title: "Atención al Cliente y Ventas",
    emoji: "📲",
    weight: 3,
    hint: "Mensajes, leads, correos y oportunidades comerciales.",
    tasks: [
      "Seguimiento a mensajes de WhatsApp y Keybe",
      "Seguimiento a correos electrónicos",
      "Seguimiento a clientes potenciales",
      "Revisión de oportunidades sin respuesta",
      "Mejora del flujo de comunicación de Keybe"
    ]
  },
  {
    title: "Diseño y Marketing",
    emoji: "🎨",
    weight: 4,
    hint: "Campañas, contenido, pauta, marca y próximos lanzamientos.",
    tasks: [
      "Revisión de campañas activas",
      "Actualizar contenido para marketing",
      "Revisión de métricas de pauta",
      "Ideas de contenido para redes",
      "Revisión de piezas pendientes"
    ]
  },
  {
    title: "Académico",
    emoji: "🎼",
    weight: 5,
    hint: "Programación, docentes, estudiantes, procesos y calidad pedagógica.",
    tasks: [
      "Seguimiento a docentes y novedades",
      "Revisión de programación académica",
      "Seguimiento a estudiantes o familias especiales",
      "Revisión de tareas académicas pendientes",
      "Programas online"
    ]
  },
  {
    title: "Recursos Humanos",
    emoji: "🤝",
    weight: 6,
    hint: "Equipo, contratación, jornadas, novedades y comunicación interna.",
    tasks: [
      "Comunicación con equipo (avisos)",
      "Novedades de nómina",
      "Contratación",
      "Jornadas de trabajo",
      "Radicación de incapacidades"
    ]
  },
  {
    title: "Alianzas y convenios",
    emoji: "🌉",
    weight: 7,
    hint: "FSA, marcas aliadas, convenios y oportunidades externas.",
    tasks: [
      "FSA",
      "FESICOL",
      "AMESE",
      "GoIntegro",
      "FONEH",
      "Son Geniales",
      "Faber Castell",
      "British Columbia Group",
      "Addi",
      "Bold",
      "Full 80's",
      "Gestionarte",
      "chatholamaestro",
      "Safe Mode",
      "Controversia",
      "Bionic",
      "Buscar nuevas alianzas y convenios"
    ]
  },
  {
    title: "Eventos y Actividades",
    emoji: "🎤",
    weight: 8,
    hint: "Muestras, festivales, vacacionales y experiencias especiales.",
    tasks: [
      "AlegreMente",
      "Musicala Fest",
      "Muestras de proceso",
      "Vacacionales",
      "Actividades especiales o alianzas"
    ]
  },
  {
    title: "Legal",
    emoji: "⚖️",
    weight: 9,
    hint: "Licencias, contratos, trámites y respaldos formales.",
    tasks: [
      "Licencia de Secretaría de Educación",
      "Verificación de contratos vigentes",
      "Seguimiento trámites (Cámara de Comercio / SEC)",
      "Revisión de documentos pendientes",
      "Soportes legales por archivar"
    ]
  },
  {
    title: "Gerencia y administración",
    emoji: "🗂️",
    weight: 10,
    hint: "Agenda, bandejas, operación diaria y pendientes críticos.",
    tasks: [
      "Agenda y tareas de equipo",
      "Revisión de bandeja de pendientes críticos",
      "Compra menor / gestiones administrativas",
      "Revisión de documentos por enviar",
      "Organización de tareas de la semana"
    ]
  },
  {
    title: "Seguridad y Salud en el Trabajo",
    emoji: "🦺",
    weight: 11,
    hint: "SG-SST, incidentes, Safe Mode y responsabilidades laborales.",
    tasks: [
      "Comité de Convivencia Laboral (CCL)",
      "Verificación de incidentes / novedades",
      "Tareas SG-SST programadas hoy",
      "Seguimiento Safe Mode",
      "Soportes o reportes SG-SST"
    ]
  },
  {
    title: "Organización y Servicios Generales",
    emoji: "🧹",
    weight: 12,
    hint: "Aseo, orden, inventario, mantenimiento y espacios.",
    tasks: [
      "Aseo y orden de espacios",
      "Inventario básico (papelería / limpieza)",
      "Solicitudes de mantenimiento",
      "Revisión de salones y recepción",
      "Elementos por comprar o reponer"
    ]
  },
  {
    title: "Acción Social y Comunitaria",
    emoji: "🌱",
    weight: 13,
    hint: "Centros, comunidad, casos especiales y acciones con impacto.",
    tasks: [
      "Contacto con comunidad/centros",
      "Seguimiento a casos especiales",
      "Registro de acciones del día",
      "Pendientes con líderes o aliados sociales",
      "Evidencias por organizar"
    ]
  },
  {
    title: "Investigación y Convocatorias",
    emoji: "🔎",
    weight: 14,
    hint: "Convocatorias, oportunidades, postulaciones y crecimiento.",
    tasks: [
      "Búsqueda de nuevas convocatorias",
      "Seguimiento de postulaciones",
      "Revisión de requisitos",
      "Ideas de proyectos postulables",
      "Documentos base para convocatorias"
    ]
  },
  {
    title: "Compras",
    emoji: "🛒",
    weight: 15,
    hint: "Necesidades, cotizaciones, compras menores y facturas.",
    tasks: [
      "Revisión de necesidades urgentes",
      "Cotización / compra menor",
      "Registro de factura / soporte",
      "Comparación de proveedores",
      "Seguimiento a entregas"
    ]
  },
  {
    title: "Seguridad y Supervisión",
    emoji: "🛡️",
    weight: 16,
    hint: "Prevención, infraestructura, riesgos y seguridad de la sede.",
    tasks: [
      "Supervisión general de seguridad",
      "Seguimiento y prevención de situaciones de inseguridad",
      "Revisión y mantenimiento de los elementos de seguridad",
      "Revisión de accesos y cierres",
      "Novedades de seguridad por registrar"
    ]
  }
];

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const state = {
  data: null,
  open: {},
  search: "",
  filter: "all",
  sort: "radar",
  highlighted: null,
  lastSavedNotes: {},
  user: null,
  started: false
};

function getActor(){
  if (!state.user) throw new Error("Debes iniciar sesión para modificar el radar.");
  return { name: state.user.name, email: state.user.email };
}

async function logAudit(action, details = {}){
  const actor = getActor();
  try {
    await firestore.collection(AUDIT_COLLECTION).add({
      action,
      actorName: actor.name,
      actorEmail: actor.email,
      occurredAt: firebase.firestore.FieldValue.serverTimestamp(),
      clientOccurredAt: Date.now(),
      ...details
    });
  } catch (error){
    // El tablero sigue funcionando si el historial tiene una incidencia temporal.
    console.error("No se pudo guardar la auditoría en Firestore.", error);
  }
}

function showLogin(message = "Solo pueden acceder Alek y Cata.", isError = false){
  document.body.classList.remove("auth-pending");
  $("#appShell").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
  const messageEl = $("#loginMessage");
  messageEl.textContent = message;
  messageEl.classList.toggle("error", isError);
}

function showApp(user){
  document.body.classList.remove("auth-pending");
  $("#loginView").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  $("#signedInUser").textContent = `${user.name} · ${user.email}`;
}

function escapeHTML(value = ""){
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  }[char]));
}

function keyize(value){
  return String(value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.#$/\[\]]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function getTodayColombia(){
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function formatDateTime(timestamp){
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const fecha = d.toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
  const hora = d.toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  return `${fecha} ${hora}`;
}

function formatTime(timestamp){
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function defaultPriority(areaTitle, taskLabel){
  const text = `${areaTitle} ${taskLabel}`.toLowerCase();
  if (/flujo de caja|pagos|ingresos|pqrs|decisiones urgentes|cliente|ventas|incapacidades|contrataci|legal|licencia|sg-sst|seguridad|safe mode/.test(text)) return "alta";
  if (/campañas|indicadores|docentes|programaci|nómina|contratos|convenios|eventos|compras|convocatorias/.test(text)) return "media";
  return "baja";
}

function createTask(areaTitle, label, previous = {}){
  return {
    label,
    done: Boolean(previous.done),
    by: previous.by && PEOPLE.includes(previous.by) ? previous.by : (previous.by === "Ambos" ? "Alek" : null),
    time: previous.time || previous.updatedAt || null,
    updatedAt: previous.updatedAt || previous.time || null,
    notes: previous.notes || "",
    priority: previous.priority || defaultPriority(areaTitle, label),
    custom: Boolean(previous.custom),
    deleted: Boolean(previous.deleted),
    createdBy: previous.createdBy || null,
    createdByEmail: previous.createdByEmail || null,
    updatedBy: previous.updatedBy || null,
    updatedByEmail: previous.updatedByEmail || null
  };
}

function createFreshCategories(previousCategories = {}){
  const categories = {};
  AREAS.forEach((area) => {
    const catKey = keyize(area.title);
    const previousCat = previousCategories[catKey] || {};
    categories[catKey] = {
      title: area.title,
      emoji: area.emoji,
      hint: area.hint,
      weight: area.weight,
      tasks: {}
    };
    area.tasks.forEach((taskLabel) => {
      const taskKey = keyize(taskLabel);
      const previousTask = previousCat.tasks?.[taskKey] || {};
      categories[catKey].tasks[taskKey] = createTask(area.title, previousTask.label || taskLabel, previousTask);
    });
    // Conservar tareas personalizadas agregadas desde el front.
    Object.entries(previousCat.tasks || {}).forEach(([taskKey, prevTask]) => {
      if (categories[catKey].tasks[taskKey]) return;
      if (!prevTask || !prevTask.label) return;
      categories[catKey].tasks[taskKey] = createTask(area.title, prevTask.label, { ...prevTask, custom: true });
    });
  });
  return categories;
}

function createBlankCategories(){
  const categories = {};
  AREAS.forEach((area) => {
    const catKey = keyize(area.title);
    categories[catKey] = {
      title: area.title,
      emoji: area.emoji,
      hint: area.hint,
      weight: area.weight,
      tasks: {}
    };
    area.tasks.forEach((taskLabel) => {
      const taskKey = keyize(taskLabel);
      categories[catKey].tasks[taskKey] = createTask(area.title, taskLabel);
    });
  });
  return categories;
}

async function ensureInit(){
  const actor = getActor();
  const today = getTodayColombia();
  $("#today").textContent = today;

  const snap = await db.ref(ROOT_PATH).get();
  if (!snap.exists()){
    await db.ref(ROOT_PATH).set({
      dateLabel: today,
      categories: createBlankCategories(),
      updatedAt: Date.now(),
      allAreasCoveredAt: null,
      createdAt: Date.now(),
      createdBy: actor.name,
      createdByEmail: actor.email
    });
    return;
  }

  const current = snap.val() || {};
  const patchedCategories = createFreshCategories(current.categories || {});
  // Modo continuo: el avance se conserva entre días; solo se actualiza la fecha visible.
  await db.ref(ROOT_PATH).update({
    categories: patchedCategories,
    updatedAt: current.updatedAt || Date.now(),
    dateLabel: today,
    updatedBy: actor.name,
    updatedByEmail: actor.email
  });
}

function startLive(){
  db.ref(ROOT_PATH).on("value", (snap) => {
    const data = snap.val();
    if (!data) return;
    state.data = data;
    render(data);
    maybeStampAllAreasCovered(data);
  });
}

// Tareas de un área: las fijas de AREAS + las personalizadas guardadas en Firebase.
function areaTaskEntries(area, catInfo = {}){
  const entries = area.tasks.map((taskLabel) => {
    const taskKey = keyize(taskLabel);
    return { taskKey, task: catInfo.tasks?.[taskKey] || createTask(area.title, taskLabel) };
  }).filter(({ task }) => !task?.deleted);
  const defaultKeys = new Set(entries.map(e => e.taskKey));
  Object.entries(catInfo.tasks || {}).forEach(([taskKey, task]) => {
    if (defaultKeys.has(taskKey) || !task?.label || task.deleted) return;
    entries.push({ taskKey, task });
  });
  return entries;
}

function flattenTasks(categories = {}){
  const flat = [];
  AREAS.forEach((area) => {
    const catKey = keyize(area.title);
    const catInfo = categories[catKey] || {};
    areaTaskEntries(area, catInfo).forEach(({ taskKey, task }) => {
      const taskLabel = task.label;
      flat.push({
        catKey,
        taskKey,
        catTitle: area.title,
        emoji: area.emoji,
        hint: area.hint,
        weight: area.weight,
        label: task.label || taskLabel,
        done: Boolean(task.done),
        by: task.by || null,
        byEmail: task.byEmail || null,
        time: task.time || null,
        updatedAt: task.updatedAt || task.time || null,
        notes: task.notes || "",
        priority: task.priority || defaultPriority(area.title, taskLabel),
        custom: Boolean(task.custom)
      });
    });
  });
  return flat;
}

function areaStats(categories = {}){
  return AREAS.map((area) => {
    const catKey = keyize(area.title);
    const tasks = areaTaskEntries(area, categories[catKey] || {}).map(e => e.task);
    const total = tasks.length;
    const done = tasks.filter((task) => task.done).length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const touched = done > 0;
    const latest = tasks.filter(t => t.done && t.time).sort((a,b) => b.time - a.time)[0] || null;
    return { ...area, catKey, total, done, pct, touched, latest };
  });
}

function getMetrics(data){
  const flat = flattenTasks(data.categories || {});
  const areas = areaStats(data.categories || {});
  const total = flat.length;
  const done = flat.filter(t => t.done).length;
  const pending = total - done;
  const coveredAreas = areas.filter(a => a.touched).length;
  const emptyAreas = areas.filter(a => !a.touched);
  const latest = flat.filter(t => t.done && t.time).sort((a,b) => b.time - a.time)[0] || null;
  const byPerson = PEOPLE.reduce((acc, person) => {
    acc[person] = flat.filter(t => t.done && t.by === person).length;
    return acc;
  }, {});
  const criticalPending = flat.filter(t => !t.done && t.priority === "alta").length;
  const notesCount = flat.filter(t => t.notes?.trim()).length;
  return { flat, areas, total, done, pending, coveredAreas, emptyAreas, latest, byPerson, criticalPending, notesCount };
}

function getAreaStatusClass(area){
  if (area.done === 0) return "empty";
  if (area.done < Math.ceil(area.total * .5)) return "partial";
  return "covered";
}

function getAreaStatusText(area){
  if (area.done === 0) return "Sin tocar";
  if (area.done < Math.ceil(area.total * .5)) return "En radar";
  return "Bien cubierta";
}

function pickNextTaskFor(person, metrics, avoidCatKey = null){
  const pendingByArea = metrics.areas
    .map(area => {
      const pendingTasks = metrics.flat.filter(task => task.catKey === area.catKey && !task.done);
      return { area, pendingTasks };
    })
    .filter(item => item.pendingTasks.length);

  const priorityOrder = { alta: 1, media: 2, baja: 3 };
  const untouched = pendingByArea
    .filter(item => !item.area.touched)
    .sort((a,b) => a.area.weight - b.area.weight);

  const candidates = untouched.length
    ? untouched
    : pendingByArea.sort((a,b) => {
        if (a.area.catKey === avoidCatKey && b.area.catKey !== avoidCatKey) return 1;
        if (b.area.catKey === avoidCatKey && a.area.catKey !== avoidCatKey) return -1;
        if (a.area.pct !== b.area.pct) return a.area.pct - b.area.pct;
        return a.area.weight - b.area.weight;
      });

  if (!candidates.length) return null;

  const chosenArea = candidates[0].area;
  const task = candidates[0].pendingTasks.sort((a,b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return a.label.localeCompare(b.label, "es");
  })[0];

  return {
    person,
    area: chosenArea,
    task,
    reason: untouched.length
      ? "Esta área todavía no ha recibido atención hoy. El radar está señalando ese huequito, muy sutil él."
      : "Es una de las áreas con menor avance pendiente. Mejor mirarla antes de que se vuelva incendio con logo."
  };
}

function buildAlerts(metrics, data){
  const alerts = [];
  if (metrics.emptyAreas.length){
    alerts.push({ type: "warn", text: `${metrics.emptyAreas.length} áreas sin tocar` });
  } else {
    alerts.push({ type: "ok", text: "Todos los frentes tienen al menos una acción" });
  }
  if (metrics.criticalPending){
    alerts.push({ type: "warn", text: `${metrics.criticalPending} pendientes de alta prioridad` });
  }
  const diff = Math.abs(metrics.byPerson.Alek - metrics.byPerson.Cata);
  if (diff >= 3){
    const behind = metrics.byPerson.Alek < metrics.byPerson.Cata ? "Alek" : "Cata";
    alerts.push({ type: "info", text: `${behind} podría tomar la próxima para equilibrar carga` });
  }
  if (metrics.notesCount){
    alerts.push({ type: "info", text: `${metrics.notesCount} tareas tienen notas` });
  }
  return alerts.slice(0, 4);
}

function render(data){
  const metrics = getMetrics(data);
  const latest = metrics.latest;
  const otherPerson = latest?.by === "Alek" ? "Cata" : "Alek";
  const mainSuggestion = pickNextTaskFor(otherPerson, metrics, latest?.catKey);
  const alekSuggestion = pickNextTaskFor("Alek", metrics, latest?.catKey);
  const cataSuggestion = pickNextTaskFor("Cata", metrics, latest?.catKey);

  renderOldDayBanner(data);
  renderHero(metrics, latest, mainSuggestion, data);
  renderStats(metrics);
  renderProgress(metrics);
  renderPersonalSuggestions(alekSuggestion, cataSuggestion);
  renderActivity(metrics);
  renderCoverageMap(metrics);
  renderCategories(data.categories || {}, metrics);
}

function renderOldDayBanner(data){
  // Modo continuo: el radar retoma donde quedó. Solo avisamos (suave) si la fecha guardada quedó vieja.
  const banner = $("#oldDayBanner");
  const today = getTodayColombia();
  if (data.dateLabel && data.dateLabel !== today){
    banner.classList.remove("hidden");
    banner.textContent = `Retomando el avance que quedó del ${data.dateLabel}. Nada se reinicia solo; si quieren empezar en blanco, usen “Reiniciar ciclo”.`;
  } else {
    banner.classList.add("hidden");
    banner.textContent = "";
  }
}

function renderHero(metrics, latest, suggestion, data){
  const headline = $("#mainHeadline");
  const suggestionText = $("#mainSuggestion");
  const lastAction = $("#lastAction");

  if (!latest){
    headline.textContent = "Arranquen por el radar principal";
    const first = pickNextTaskFor(getActor().name, metrics);
    suggestionText.textContent = first
      ? `${first.person} podría empezar por ${first.area.emoji} ${first.area.title}: “${first.task.label}”. Así el día no empieza con la elegante estrategia de improvisar.`
      : "Todo está cubierto. Sospechoso, pero agradable.";
    lastAction.textContent = "Todavía no hay tareas marcadas hoy.";
  } else {
    const other = latest.by === "Alek" ? "Cata" : "Alek";
    headline.textContent = `${latest.by} movió ${latest.emoji} ${latest.catTitle}`;
    suggestionText.textContent = suggestion
      ? `${latest.by} hizo “${latest.label}” a las ${formatTime(latest.time)}. Para balancear gerencia, ${other} podría mirar ${suggestion.area.emoji} ${suggestion.area.title}: “${suggestion.task.label}”.`
      : `${latest.by} hizo “${latest.label}”. Ya no hay pendientes en el radar. Milagro administrativo, favor documentarlo.`;
    lastAction.innerHTML = `<strong>${escapeHTML(latest.by)} hizo:</strong> ${escapeHTML(latest.label)}<br><small>${escapeHTML(latest.catTitle)} · ${escapeHTML(formatDateTime(latest.time))}</small>`;
  }

  const alerts = buildAlerts(metrics, data);
  $("#smartAlerts").innerHTML = alerts.map(alert => `<span class="chip ${alert.type}">${escapeHTML(alert.text)}</span>`).join("");
}

function renderStats(metrics){
  const taskPct = metrics.total ? Math.round(metrics.done / metrics.total * 100) : 0;
  const areaPct = AREAS.length ? Math.round(metrics.coveredAreas / AREAS.length * 100) : 0;
  const leader = metrics.byPerson.Alek === metrics.byPerson.Cata
    ? "Empate"
    : (metrics.byPerson.Alek > metrics.byPerson.Cata ? "Alek" : "Cata");

  const cards = [
    { n: `${areaPct}%`, label: "Cobertura de áreas", small: `${metrics.coveredAreas}/${AREAS.length} frentes abordados` },
    { n: `${taskPct}%`, label: "Avance de tareas", small: `${metrics.done}/${metrics.total} completadas` },
    { n: metrics.emptyAreas.length, label: "Áreas sin tocar", small: metrics.emptyAreas[0] ? `Primera: ${metrics.emptyAreas[0].title}` : "Todo tiene movimiento" },
    { n: metrics.criticalPending, label: "Alta prioridad", small: "Pendientes sensibles" },
    { n: metrics.byPerson.Alek, label: "Alek", small: "Tareas hechas hoy" },
    { n: metrics.byPerson.Cata, label: "Cata", small: leader === "Empate" ? "Carga balanceada" : `Va adelante: ${leader}` }
  ];

  $("#statsGrid").innerHTML = cards.map(card => `
    <article class="stat-card">
      <strong>${escapeHTML(card.n)}</strong>
      <span>${escapeHTML(card.label)}</span>
      <small>${escapeHTML(card.small)}</small>
    </article>
  `).join("");
}

function renderProgress(metrics){
  const areaPct = AREAS.length ? Math.round(metrics.coveredAreas / AREAS.length * 100) : 0;
  $("#areaProgFill").style.width = `${areaPct}%`;
  $("#areaPct").textContent = `${areaPct}%`;
  $("#areaDetail").textContent = `${metrics.coveredAreas} de ${AREAS.length} áreas`;
  $("#taskDetail").textContent = `${metrics.done} de ${metrics.total} tareas completadas`;
  $("#balanceDetail").textContent = `Alek ${metrics.byPerson.Alek} · Cata ${metrics.byPerson.Cata}`;
}

function renderPersonalSuggestions(alekSuggestion, cataSuggestion){
  fillSuggestion("alek", alekSuggestion);
  fillSuggestion("cata", cataSuggestion);
}

function fillSuggestion(prefix, suggestion){
  const title = $(`#${prefix}SuggestionTitle`);
  const text = $(`#${prefix}SuggestionText`);
  const btn = $(`#do${prefix === "alek" ? "Alek" : "Cata"}Suggestion`);

  if (!suggestion){
    title.textContent = "Sin pendientes";
    text.textContent = "No hay una siguiente tarea clara. Esto pasa cada vez que el universo decide cooperar.";
    btn.disabled = true;
    return;
  }
  title.textContent = `${suggestion.area.emoji} ${suggestion.area.title}`;
  text.textContent = `${suggestion.task.label}. ${suggestion.reason}`;
  btn.disabled = false;
  btn.dataset.catKey = suggestion.task.catKey;
  btn.dataset.taskKey = suggestion.task.taskKey;
  btn.dataset.person = suggestion.person;
}

function renderActivity(metrics){
  const recent = metrics.flat
    .filter(t => t.done && t.time)
    .sort((a,b) => b.time - a.time)
    .slice(0, 8);

  if (!recent.length){
    $("#activityFeed").innerHTML = `<div class="activity-item"><strong>Sin actividad</strong><small>El tablero está esperando que alguien haga algo. Dramático, pero cierto.</small></div>`;
    return;
  }

  $("#activityFeed").innerHTML = recent.map(item => `
    <div class="activity-item">
      <strong>${escapeHTML(item.by || "—")} · ${escapeHTML(item.emoji)} ${escapeHTML(item.catTitle)}</strong>
      <span>${escapeHTML(item.label)}</span><br>
      <small>${escapeHTML(formatDateTime(item.time))}</small>
    </div>
  `).join("");
}

function renderCoverageMap(metrics){
  $("#coverageMap").innerHTML = metrics.areas.map(area => {
    const cls = getAreaStatusClass(area);
    return `
      <button class="coverage-item ${cls}" data-cat-key="${area.catKey}" title="Abrir ${escapeHTML(area.title)}">
        <span><span class="dot"></span> ${escapeHTML(area.emoji)} ${escapeHTML(area.title)}</span>
        <small>${area.done}/${area.total}</small>
      </button>
    `;
  }).join("");
}

function renderCategories(categories, metrics){
  const wrap = $("#cats");
  const catTmpl = $("#catTmpl");
  const taskTmpl = $("#taskTmpl");
  const search = state.search.trim().toLowerCase();
  const filter = state.filter;
  const sortMode = state.sort;

  let areas = [...metrics.areas];
  if (sortMode === "progressLow"){
    areas.sort((a,b) => a.pct - b.pct || a.weight - b.weight);
  } else if (sortMode === "alpha"){
    areas.sort((a,b) => a.title.localeCompare(b.title, "es"));
  } else {
    areas.sort((a,b) => {
      if (a.touched !== b.touched) return a.touched ? 1 : -1;
      return a.weight - b.weight;
    });
  }

  wrap.innerHTML = "";

  areas.forEach((area) => {
    if (filter === "untouchedAreas" && area.touched) return;

    const catInfo = categories[area.catKey] || {};
    const catNode = catTmpl.content.cloneNode(true);
    const section = catNode.querySelector(".cat");
    const titleEl = catNode.querySelector(".catTitle");
    const hintEl = catNode.querySelector(".catHint");
    const toggle = catNode.querySelector(".toggleBtn");
    const tasksEl = catNode.querySelector(".tasks");
    const catFill = catNode.querySelector(".catProgressFill");
    const catMeta = catNode.querySelector(".catMeta");
    const catStatus = catNode.querySelector(".catStatus");

    section.dataset.catKey = area.catKey;
    titleEl.textContent = `${area.emoji} ${area.title}`;
    hintEl.textContent = area.hint;
    catFill.style.width = `${area.pct}%`;
    catMeta.textContent = `${area.done} / ${area.total}`;
    const statusClass = getAreaStatusClass(area);
    catStatus.className = `catStatus ${statusClass}`;
    catStatus.textContent = getAreaStatusText(area);

    // Subtareas comprimidas por defecto para buscar más fácil.
    // Si hay búsqueda o filtro activo, se expanden para mostrar resultados.
    const hasQuery = Boolean(search) || (filter && filter !== "all");
    const isOpen = hasQuery ? true : (state.open[area.catKey] ?? false);
    section.classList.toggle("collapsed", !isOpen);
    toggle.textContent = isOpen ? "▾" : "▸";

    let added = 0;
    areaTaskEntries(area, catInfo).forEach(({ taskKey, task: rawTask }) => {
      const taskLabel = rawTask.label;
      const info = {
        catKey: area.catKey,
        taskKey,
        catTitle: area.title,
        label: rawTask.label || taskLabel,
        done: Boolean(rawTask.done),
        by: rawTask.by || null,
        byEmail: rawTask.byEmail || null,
        time: rawTask.time || null,
        notes: rawTask.notes || "",
        priority: rawTask.priority || defaultPriority(area.title, taskLabel),
        custom: Boolean(rawTask.custom),
        deleted: Boolean(rawTask.deleted)
      };

      if (!passesFilter(info, area, filter, search)) return;
      added++;

      const tNode = taskTmpl.content.cloneNode(true);
      const taskDiv = tNode.querySelector(".task");
      const chk = tNode.querySelector(".chk");
      const name = tNode.querySelector(".taskName");
      const byEl = tNode.querySelector(".by");
      const timeEl = tNode.querySelector(".time");
      const note = tNode.querySelector(".note");
      const priority = tNode.querySelector(".priority-pill");
      const editBtn = tNode.querySelector(".editTask");
      const delBtn = tNode.querySelector(".deleteTask");

      taskDiv.dataset.catKey = area.catKey;
      taskDiv.dataset.taskKey = taskKey;
      taskDiv.classList.toggle("done", info.done);
      taskDiv.classList.toggle("suggested", state.highlighted?.catKey === area.catKey && state.highlighted?.taskKey === taskKey);
      chk.checked = info.done;
      chk.dataset.catKey = area.catKey;
      chk.dataset.taskKey = taskKey;
      name.textContent = info.label;
      byEl.textContent = info.by ? `Hecho por: ${info.by}${info.byEmail ? ` (${info.byEmail})` : ""}` : "Pendiente";
      timeEl.textContent = info.time ? formatDateTime(info.time) : "";
      note.value = info.notes || "";
      note.dataset.catKey = area.catKey;
      note.dataset.taskKey = taskKey;
      priority.textContent = `Prioridad ${info.priority}`;
      priority.className = `priority-pill ${info.priority}`;
      editBtn.dataset.catKey = area.catKey;
      editBtn.dataset.taskKey = taskKey;
      delBtn.dataset.catKey = area.catKey;
      delBtn.dataset.taskKey = taskKey;

      tasksEl.appendChild(tNode);
    });

    if (added === 0){
      tasksEl.innerHTML = `<div class="task"><strong>No hay tareas con ese filtro.</strong><div class="task-tools">El filtro está siendo más estricto que portería de colegio.</div></div>`;
    }

    wrap.appendChild(catNode);
  });

  if (!wrap.children.length){
    wrap.innerHTML = `<section class="cat"><strong>No hay resultados.</strong><p class="catHint">Prueba limpiar búsqueda o cambiar el filtro.</p></section>`;
  }
}

function passesFilter(task, area, filter, search){
  const haystack = `${task.label} ${task.catTitle} ${task.by || ""} ${task.notes || ""}`.toLowerCase();
  if (search && !haystack.includes(search)) return false;
  if (filter === "pending" && task.done) return false;
  if (filter === "done" && !task.done) return false;
  if (filter === "critical" && (task.done || task.priority !== "alta")) return false;
  if (filter === "alek" && task.by !== "Alek") return false;
  if (filter === "cata" && task.by !== "Cata") return false;
  if (filter === "untouchedAreas" && area.touched) return false;
  return true;
}

async function updateTask(catKey, taskKey, done){
  const actor = getActor();
  const payload = {
    done,
    by: done ? actor.name : null,
    byEmail: done ? actor.email : null,
    time: done ? Date.now() : null,
    updatedBy: actor.name,
    updatedByEmail: actor.email,
    updatedAt: Date.now()
  };
  await db.ref(`${ROOT_PATH}/categories/${catKey}/tasks/${taskKey}`).update(payload);
  await db.ref(ROOT_PATH).update({ updatedAt: Date.now() });
  await logAudit(done ? "task_completed" : "task_reopened", { catKey, taskKey });
}

async function updateNote(catKey, taskKey, notes){
  const actor = getActor();
  const cleanNotes = notes.trim();
  const noteKey = `${catKey}/${taskKey}`;
  if (state.lastSavedNotes[noteKey] === cleanNotes) return;
  state.lastSavedNotes[noteKey] = cleanNotes;
  await db.ref(`${ROOT_PATH}/categories/${catKey}/tasks/${taskKey}`).update({
    notes: cleanNotes,
    updatedBy: actor.name,
    updatedByEmail: actor.email,
    updatedAt: Date.now()
  });
  await db.ref(ROOT_PATH).update({ updatedAt: Date.now() });
  await logAudit("task_note_updated", { catKey, taskKey, hasNote: Boolean(cleanNotes) });
}

async function addTask(catKey, label){
  const actor = getActor();
  const cleanLabel = label.trim();
  if (!cleanLabel) return;
  const area = AREAS.find(a => keyize(a.title) === catKey);
  let taskKey = keyize(cleanLabel);
  const existing = state.data?.categories?.[catKey]?.tasks || {};
  if (existing[taskKey]) taskKey = `${taskKey}_${Date.now()}`;
  const task = createTask(area?.title || "", cleanLabel, {
    custom: true,
    createdBy: actor.name,
    createdByEmail: actor.email,
    updatedBy: actor.name,
    updatedByEmail: actor.email,
    updatedAt: Date.now()
  });
  await db.ref(`${ROOT_PATH}/categories/${catKey}/tasks/${taskKey}`).set(task);
  await db.ref(ROOT_PATH).update({ updatedAt: Date.now() });
  await logAudit("task_created", { catKey, taskKey, label: cleanLabel });
  state.open[catKey] = true;
}

async function editTask(catKey, taskKey){
  const actor = getActor();
  const task = state.data?.categories?.[catKey]?.tasks?.[taskKey];
  if (!task) return;
  const nextLabel = prompt("Nuevo nombre de la tarea:", task.label || "");
  if (nextLabel === null) return;
  const cleanLabel = nextLabel.trim();
  if (!cleanLabel || cleanLabel === task.label) return;
  const area = AREAS.find(a => keyize(a.title) === catKey);
  await db.ref(`${ROOT_PATH}/categories/${catKey}/tasks/${taskKey}`).update({
    label: cleanLabel,
    priority: task.priority || defaultPriority(area?.title || "", cleanLabel),
    updatedBy: actor.name,
    updatedByEmail: actor.email,
    updatedAt: Date.now()
  });
  await db.ref(ROOT_PATH).update({ updatedAt: Date.now() });
  await logAudit("task_renamed", { catKey, taskKey, previousLabel: task.label || "", label: cleanLabel });
}

async function deleteTask(catKey, taskKey){
  const actor = getActor();
  const task = state.data?.categories?.[catKey]?.tasks?.[taskKey];
  if (!task) return;
  const ok = confirm(`¿Eliminar la tarea “${task.label}”?`);
  if (!ok) return;
  const ref = db.ref(`${ROOT_PATH}/categories/${catKey}/tasks/${taskKey}`);
  if (task.custom){
    await ref.remove();
  } else {
    await ref.update({
      deleted: true,
      done: false,
      by: null,
      byEmail: null,
      time: null,
      updatedBy: actor.name,
      updatedByEmail: actor.email,
      updatedAt: Date.now()
    });
  }
  await db.ref(ROOT_PATH).update({ updatedAt: Date.now() });
  await logAudit("task_deleted", { catKey, taskKey, label: task.label || "", custom: Boolean(task.custom) });
}

async function resetDay(){
  const actor = getActor();
  if (!state.data) return;
  const ok = confirm("¿Archivar todo el avance actual al historial y reiniciar el radar en blanco? El progreso normalmente se conserva entre días: solo haz esto si de verdad quieren empezar un ciclo nuevo.");
  if (!ok) return;
  const today = getTodayColombia();
  const archiveKey = `${state.data.dateLabel || today}_${Date.now()}`;
  await db.ref(`${HISTORY_PATH}/${archiveKey}`).set({
    ...state.data,
    archivedAt: Date.now(),
    archivedBy: actor.name,
    archivedByEmail: actor.email,
    archivedFrom: ROOT_PATH
  });
  state.open = {};
  state.highlighted = null;
  // El reinicio limpia el progreso pero conserva las tareas personalizadas creadas desde el front.
  const blank = createBlankCategories();
  Object.entries(state.data.categories || {}).forEach(([catKey, cat]) => {
    Object.entries(cat?.tasks || {}).forEach(([taskKey, task]) => {
      if (blank[catKey]?.tasks?.[taskKey] && (task?.deleted || task?.label)){
        blank[catKey].tasks[taskKey] = createTask(cat.title || "", task.label || blank[catKey].tasks[taskKey].label, {
          custom: false,
          deleted: Boolean(task.deleted),
          priority: task.priority
        });
      }
      if (task?.custom && blank[catKey] && !blank[catKey].tasks[taskKey]){
        blank[catKey].tasks[taskKey] = createTask(cat.title || "", task.label, { custom: true, priority: task.priority });
      }
    });
  });
  await db.ref(ROOT_PATH).set({
    dateLabel: today,
    categories: blank,
    updatedAt: Date.now(),
    allAreasCoveredAt: null,
    createdAt: Date.now(),
    createdBy: actor.name,
    createdByEmail: actor.email
  });
  await logAudit("cycle_reset", { archiveKey, archivedDateLabel: state.data.dateLabel || today });
}

async function maybeStampAllAreasCovered(data){
  const metrics = getMetrics(data);
  const allCovered = metrics.coveredAreas === AREAS.length;
  if (allCovered && !data.allAreasCoveredAt){
    await db.ref(`${ROOT_PATH}/allAreasCoveredAt`).set(Date.now());
    setTimeout(() => alert("🎉 Radar cubierto: todos los frentes de Musicala tienen al menos una acción hoy. No es paz mundial, pero ayuda."), 100);
  }
}

// ---- Historial ----

function summarizeHistoryEntry(entry){
  const metrics = getMetrics(entry || {});
  const doneTasks = metrics.flat
    .filter(t => t.done)
    .sort((a,b) => (b.time || 0) - (a.time || 0));
  return { metrics, doneTasks };
}

function renderHistoryEntry(key, entry){
  const { metrics, doneTasks } = summarizeHistoryEntry(entry);
  const areaPct = AREAS.length ? Math.round(metrics.coveredAreas / AREAS.length * 100) : 0;
  const taskPct = metrics.total ? Math.round(metrics.done / metrics.total * 100) : 0;

  const tasksHTML = doneTasks.length
    ? doneTasks.map(task => `
        <div class="history-task">
          <strong>${escapeHTML(task.emoji)} ${escapeHTML(task.catTitle)}</strong>
          <span>${escapeHTML(task.label)}</span>
          <small>${escapeHTML(task.by || "—")}${task.time ? ` · ${escapeHTML(formatDateTime(task.time))}` : ""}</small>
          ${task.notes?.trim() ? `<p class="history-note">📝 ${escapeHTML(task.notes)}</p>` : ""}
        </div>
      `).join("")
    : `<div class="history-task"><span>Este ciclo se archivó sin tareas completadas.</span></div>`;

  return `
    <article class="history-entry collapsed" data-history-key="${escapeHTML(key)}">
      <header class="history-head">
        <button class="toggleBtn historyToggle" aria-label="expandir/contraer">▸</button>
        <div class="history-title">
          <strong>${escapeHTML(entry.dateLabel || "Sin fecha")}</strong>
          <small>Archivado: ${escapeHTML(formatDateTime(entry.archivedAt))}</small>
        </div>
        <div class="history-meta">
          <span class="chip info">${metrics.done}/${metrics.total} tareas (${taskPct}%)</span>
          <span class="chip ${metrics.coveredAreas === AREAS.length ? "ok" : "warn"}">${metrics.coveredAreas}/${AREAS.length} áreas (${areaPct}%)</span>
          <span class="chip info">Alek ${metrics.byPerson.Alek} · Cata ${metrics.byPerson.Cata}</span>
        </div>
      </header>
      <div class="history-tasks">${tasksHTML}</div>
    </article>
  `;
}

async function loadHistory(){
  const list = $("#historyList");
  list.innerHTML = "Cargando historial...";
  try {
    const snap = await db.ref(HISTORY_PATH).get();
    if (!snap.exists()){
      list.innerHTML = `<div class="history-empty">Todavía no hay ciclos archivados. Cuando usen “Reiniciar ciclo”, el avance quedará guardado aquí.</div>`;
      return;
    }
    const entries = Object.entries(snap.val() || {})
      .sort((a,b) => (b[1]?.archivedAt || 0) - (a[1]?.archivedAt || 0));
    list.innerHTML = entries.map(([key, entry]) => renderHistoryEntry(key, entry || {})).join("");
  } catch (error){
    console.error(error);
    list.innerHTML = `<div class="history-empty">No se pudo cargar el historial. Revisa la conexión e intenta de nuevo.</div>`;
  }
}

function setHistoryOpen(open){
  document.body.classList.toggle("history-open", open);
  $("#historyView").classList.toggle("hidden", !open);
  if (open) loadHistory();
}

$("#historyBtn").addEventListener("click", () => setHistoryOpen(true));
$("#closeHistory").addEventListener("click", () => setHistoryOpen(false));

$("#historyList").addEventListener("click", (event) => {
  const head = event.target.closest(".history-head");
  if (!head) return;
  const entry = head.closest(".history-entry");
  entry.classList.toggle("collapsed");
  const toggle = entry.querySelector(".historyToggle");
  if (toggle) toggle.textContent = entry.classList.contains("collapsed") ? "▸" : "▾";
});

function openAndHighlight(catKey, taskKey){
  state.open[catKey] = true;
  state.highlighted = { catKey, taskKey };
  render(state.data);
  requestAnimationFrame(() => {
    const el = document.querySelector(`.task[data-cat-key="${CSS.escape(catKey)}"][data-task-key="${CSS.escape(taskKey)}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

$("#cats").addEventListener("click", async (event) => {
  const editBtn = event.target.closest(".editTask");
  if (editBtn){
    await editTask(editBtn.dataset.catKey, editBtn.dataset.taskKey);
    return;
  }

  const delBtn = event.target.closest(".deleteTask");
  if (delBtn){
    await deleteTask(delBtn.dataset.catKey, delBtn.dataset.taskKey);
    return;
  }

  const addBtn = event.target.closest(".addTaskBtn");
  if (addBtn){
    const section = addBtn.closest(".cat");
    const input = section?.querySelector(".addTaskInput");
    if (section?.dataset.catKey && input?.value.trim()){
      await addTask(section.dataset.catKey, input.value);
      input.value = "";
    }
    return;
  }

  const toggle = event.target.closest(".toggleBtn");
  if (!toggle) return;
  const section = toggle.closest(".cat");
  const catKey = section?.dataset.catKey;
  if (!catKey) return;
  state.open[catKey] = !(state.open[catKey] ?? false);
  render(state.data);
});

$("#cats").addEventListener("change", async (event) => {
  const chk = event.target.closest(".chk");
  if (!chk) return;
  await updateTask(chk.dataset.catKey, chk.dataset.taskKey, chk.checked);
});

$("#cats").addEventListener("blur", (event) => {
  const note = event.target.closest(".note");
  if (!note) return;
  updateNote(note.dataset.catKey, note.dataset.taskKey, note.value);
}, true);

$("#cats").addEventListener("keydown", async (event) => {
  const addInput = event.target.closest(".addTaskInput");
  if (addInput && event.key === "Enter"){
    event.preventDefault();
    const section = addInput.closest(".cat");
    if (section?.dataset.catKey && addInput.value.trim()){
      await addTask(section.dataset.catKey, addInput.value);
      addInput.value = "";
    }
    return;
  }

  const note = event.target.closest(".note");
  if (!note) return;
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter"){
    note.blur();
  }
});

$("#coverageMap").addEventListener("click", (event) => {
  const btn = event.target.closest(".coverage-item");
  if (!btn) return;
  const catKey = btn.dataset.catKey;
  state.open[catKey] = true;
  state.highlighted = null;
  render(state.data);
  requestAnimationFrame(() => {
    const el = document.querySelector(`.cat[data-cat-key="${CSS.escape(catKey)}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

$("#searchBox").addEventListener("input", (event) => {
  state.search = event.target.value;
  render(state.data);
});

$("#statusFilter").addEventListener("change", (event) => {
  state.filter = event.target.value;
  render(state.data);
});

$("#sortMode").addEventListener("change", (event) => {
  state.sort = event.target.value;
  render(state.data);
});

$("#expandAll").addEventListener("click", () => {
  AREAS.forEach(area => state.open[keyize(area.title)] = true);
  render(state.data);
});

$("#collapseAll").addEventListener("click", () => {
  AREAS.forEach(area => state.open[keyize(area.title)] = false);
  render(state.data);
});

$("#resetDay").addEventListener("click", resetDay);

$("#doAlekSuggestion").addEventListener("click", (event) => {
  const btn = event.currentTarget;
  if (!btn.dataset.catKey) return;
  openAndHighlight(btn.dataset.catKey, btn.dataset.taskKey);
});

$("#doCataSuggestion").addEventListener("click", (event) => {
  const btn = event.currentTarget;
  if (!btn.dataset.catKey) return;
  openAndHighlight(btn.dataset.catKey, btn.dataset.taskKey);
});

$("#googleLogin").addEventListener("click", async () => {
  const button = $("#googleLogin");
  button.disabled = true;
  showLogin("Abriendo Google…");
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await auth.signInWithPopup(provider);
  } catch (error){
    console.error(error);
    showLogin("No se pudo iniciar sesión. Revisa la ventana de Google e inténtalo de nuevo.", true);
  } finally {
    button.disabled = false;
  }
});

$("#logoutBtn").addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged(async (user) => {
  if (!user){
    state.user = null;
    if (state.started){
      db.ref(ROOT_PATH).off();
      state.started = false;
    }
    showLogin();
    return;
  }

  const email = String(user.email || "").trim().toLowerCase();
  const name = ALLOWED_USERS[email];
  if (!name){
    await auth.signOut();
    showLogin("Este correo no está autorizado para el Radar Gerencial.", true);
    return;
  }

  state.user = { name, email };
  showApp(state.user);
  if (state.started) return;
  try {
    await ensureInit();
    startLive();
    state.started = true;
  } catch (error){
    console.error(error);
    showLogin("No se pudo cargar el radar. Revisa los permisos de Firebase.", true);
  }
});
