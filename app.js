// 1) Config Firebase (tu config)
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
const db = firebase.database();

// 2) Definición de CATEGORÍAS y SUBTAREAS (tu versión)
const CATS = {
  "Recursos Humanos": [
    "Jornadas de trabajo",
    "Contratación (vacantes)",
    "Novedades de nómina",
    "Radicación de Incapacidades"
  ],
  "Investigación (Convocatorias)": [
    "Seguimiento de postulaciones",
    "Búsqueda de nuevas convocatorias"
  ],
  "Alianzas y convenios": [
    "Junta de Acción Comunal Pasadena",
    "FESICOL",
    "UD - LEA",
    "FSA",
    "AMESE",
    "Catálogo CCB - El Tiempo",
    "GoIntegro",
    "Fundación Corazón Peludito",
    "Fundación Gatitus",
    "FONEH",
    "Son Geniales",
    "Faber Castell",
    "British Columbia Group",
    "Addi",
    "Bold",
    "Full 80's",
    "Young Engineers",
    "Gestionarte",
    "chatholamaestro",
    "Safe Mode",
    "Controversia",
    "Bionic",
    "Buscar nuevas alianzas y convenios"
  ],
  "Atención al Cliente y Ventas": [
    "Seguimiento a Mensajes de WhatsApp y Keybe",
    "Seguimiento a Correos electrónicos",
    "Seguimiento a clientes potenciales",
    "Mejora del Flujo de Comunicación de Keybe",
    "Mejora de los aplicativos web de Atención al Cliente y Ventas",
    "Seguimiento de pendientes en el Calendario"
  ],
  "Diseño y Marketing": [
    "Revisión y mejora de campañas activas",
    "Revisión y mejora de la Página Web",
    "Seguimiento contenido para Redes Sociales"
  ],
  "Contabilidad y Finanzas": [
    "Seguimiento de tareas pendientes",
    "Seguimiento de Egresos",
    "Plan Financiero",
    "Pagos pendientes",
    "Seguimiento de Caja menor",
    "Solicitud de créditos y prétamos"
  ],
  "Académico": [
    "Programas Online",
    "Creación de contenido",
    "Seguimiento a docentes y novedades",
    "Talleres esporádicos",
    "Vacaciones artísticas"
  ],
  "Eventos y Actividades": [
    "Musicala Fest",
    "Muestras de Proceso - Musicala",
    "Talleres esporádicos",
    "AlegreMente",
    "Muestras de Proceso - FSA"
  ],
  "Legal": [
    "Licencia de Secretaría de Educación",
    "Actualización y mejora de contratos vigentes",
    "Actualización y mejora del reglamento interno de trabajo",
    "Seguimiento trámites legales (cámaras/SEC)"
  ],
  "Dirección": [
    "Revisión del Calendario Anual",
    "Revisión de prioridades del día",
    "Seguimiento a indicadores clave (KPI's)",
    "Seguimiento de PQRS",
    "Aprobación de decisiones urgentes"
  ],
  "Gerencia y administración": [
    "Agenda y Tareas de equipo",
    "Revisión de mensajes y correos (pendientes críticos)"
  ],
  "Seguridad y Salud en el Trabajo": [
    "Comité de Convivencia Laboral (CCL)",
    "Verificación de incidentes / novedades",
    "Tareas SG-SST programadas"
  ],
  "Organización y Servicios Generales": [
    "Aseo y orden de espacios",
    "Inventario básico (papelería / limpieza)",
    "Solicitudes de mantenimiento"
  ],
  "Acción Social y Comunitaria": [
    "Contactos y alianzas"
  ],
  "Compras": [
    "Revisión de compras pendientes",
    "Registro de factura / soporte"
  ],
  "Seguridad y Supervisión": [
    "Supervisión general de seguridad",
    "Seguimiento y prevención de situaciones de inseguridad",
    "Revisión y mantenimiento de los elementos de seguridad"
  ]
};

// 3) Utils generales
const $ = (q) => document.querySelector(q);
const todayStr = new Date().toISOString().slice(0,10);
$("#today").textContent = todayStr;

// RTDB no permite . # $ / [ ] — sanitizamos claves
const keyize = (s) => s
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[.#$/\[\]]/g, "_")
  .replace(/\s+/g, "_")
  .toLowerCase();

const ROOT_PATH = "checklistCurrentV2";

// Estado UI: categorías abiertas/cerradas (no se guarda en DB)
const OPEN = {}; // { [catKey]: true | false }

// Para no duplicar el aviso de “todas cubiertas” por cliente
let localNotifiedAllCovered = false;

// 4) Inicialización con claves seguras
async function ensureInit(){
  const snap = await db.ref(ROOT_PATH).get();
  if (!snap.exists()){
    const categories = {};
    Object.keys(CATS).forEach(catLabel=>{
      const catKey = keyize(catLabel);
      categories[catKey] = { title: catLabel, tasks: {} };
      CATS[catLabel].forEach(taskLabel=>{
        const taskKey = keyize(taskLabel);
        categories[catKey].tasks[taskKey] = {
          label: taskLabel, done:false, by:null, time:null
        };
      });
    });
    await db.ref(ROOT_PATH).set({
      dateLabel: todayStr,
      categories,
      updatedAt: Date.now(),
      allCoveredAt: null
    });
  } else {
    // Patch por si agregaste/renombraste en CATS
    const val = snap.val();
    const categories = val.categories || {};
    let changed = false;

    Object.keys(CATS).forEach(catLabel=>{
      const catKey = keyize(catLabel);
      if (!categories[catKey]) {
        categories[catKey] = { title: catLabel, tasks: {} };
        changed = true;
      } else if (categories[catKey].title !== catLabel) {
        categories[catKey].title = catLabel;
        changed = true;
      }
      const tasks = categories[catKey].tasks || {};
      CATS[catLabel].forEach(taskLabel=>{
        const taskKey = keyize(taskLabel);
        if (!tasks[taskKey]) {
          tasks[taskKey] = { label: taskLabel, done:false, by:null, time:null };
          changed = true;
        } else if (tasks[taskKey].label !== taskLabel) {
          tasks[taskKey].label = taskLabel;
          changed = true;
        }
      });
      categories[catKey].tasks = tasks;
    });

    if (changed){
      await db.ref(`${ROOT_PATH}/categories`).set(categories);
      await db.ref(`${ROOT_PATH}/updatedAt`).set(Date.now());
    }
  }
}

// 5) Escucha en vivo
function startLive(){
  db.ref(ROOT_PATH).on("value", (snap)=>{
    const data = snap.val(); if(!data) return;
    renderAll(data.categories || {});
    updateGlobalProgress(data.categories || {});
    maybeNotifyAllCovered(data);
  });
}

// 6) Render (con clase .collapsed y delegación)
function renderAll(categories){
  const wrap = $("#cats");
  wrap.innerHTML = "";
  const catTmpl = $("#catTmpl");
  const taskTmpl = $("#taskTmpl");

  Object.keys(CATS).forEach((catLabel)=>{
    const catKey = keyize(catLabel);
    const catInfo = categories[catKey] || { title: catLabel, tasks:{} };

    const catNode = catTmpl.content.cloneNode(true);
    const section  = catNode.querySelector(".cat");
    const titleEl  = catNode.querySelector(".catTitle");
    const toggle   = catNode.querySelector(".toggleBtn");
    const tasksEl  = catNode.querySelector(".tasks");
    const catFill  = catNode.querySelector(".catProgressFill");
    const catMeta  = catNode.querySelector(".catMeta");

    // Para el toggle por delegación
    section.dataset.catKey = catKey;

    titleEl.textContent = catInfo.title || catLabel;

    // Construir tareas
    let total = 0, done = 0;
    CATS[catLabel].forEach((taskLabel)=>{
      const taskKey = keyize(taskLabel);
      const info = (catInfo.tasks && catInfo.tasks[taskKey]) || { label: taskLabel, done:false, by:null, time:null };
      total++; if (info.done) done++;

      const tNode = taskTmpl.content.cloneNode(true);
      const chk   = tNode.querySelector(".chk");
      const name  = tNode.querySelector(".taskName");
      const byEl  = tNode.querySelector(".by");
      const timeEl= tNode.querySelector(".time");

      name.textContent = info.label || taskLabel;
      chk.checked = !!info.done;
      byEl.textContent = info.by ? `Hecho por: ${info.by}` : "—";

      // ⬇️ ÚNICO CAMBIO: mostrar fecha + hora (12h) cuando existe `time`
      if (info.time) {
        const d = new Date(info.time);
        const fecha = d.toLocaleDateString("es-CO"); // p.ej. 20/10/2025
        const hora  = d.toLocaleTimeString("es-CO", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }); // p.ej. 11:32 a. m.
        timeEl.textContent = `${fecha} ${hora}`;
      } else {
        timeEl.textContent = "";
      }
      // ⬆️ Fin del cambio

      chk.dataset.catKey = catKey;
      chk.dataset.taskKey = taskKey;
      chk.addEventListener("change", async (e)=>{
        const who = $("#who").value;
        await updateTask(e.target.dataset.catKey, e.target.dataset.taskKey, chk.checked ? who : null);
      });

      tasksEl.appendChild(tNode);
    });

    // Progreso por categoría
    const pct = total ? Math.round((done/total)*100) : 0;
    catFill.style.width = pct + "%";
    catMeta.textContent = `${done} / ${total}`;

    // Estado de apertura (clase .collapsed)
    const isOpen = OPEN[catKey] ?? false;
    section.classList.toggle("collapsed", !isOpen);
    toggle.textContent = isOpen ? "▾" : "▸";

    wrap.appendChild(catNode);
  });
}

// Delegación para toggles (no se rompe con re-render)
document.getElementById("cats").addEventListener("click", (e)=>{
  const btn = e.target.closest(".toggleBtn");
  if (!btn) return;
  const section = btn.closest(".cat");
  const catKey = section?.dataset?.catKey;
  if (!catKey) return;

  const nowOpen = !(OPEN[catKey] ?? false);
  OPEN[catKey] = nowOpen;
  section.classList.toggle("collapsed", !nowOpen);
  btn.textContent = nowOpen ? "▾" : "▸";
});

// 7) Progreso global (por tareas)
function updateGlobalProgress(categories){
  let total = 0, done = 0;
  Object.keys(CATS).forEach(catLabel=>{
    const catKey = keyize(catLabel);
    CATS[catLabel].forEach(taskLabel=>{
      const taskKey = keyize(taskLabel);
      total++;
      if (categories?.[catKey]?.tasks?.[taskKey]?.done) done++;
    });
  });
  const pct = total ? Math.round((done/total)*100) : 0;
  $("#progFill").style.width = pct + "%";
  $("#progPct").textContent = pct + "%";
  $("#progDetail").textContent = `${done} de ${total} tareas`;
}

// 8) Escritura de cada tarea
async function updateTask(catKey, taskKey, whoOrNull){
  const isDone = !!whoOrNull;
  await db.ref(`${ROOT_PATH}/categories/${catKey}/tasks/${taskKey}`).update({
    done: isDone,
    by: isDone ? whoOrNull : null,
    time: isDone ? Date.now() : null
  });
  await db.ref(`${ROOT_PATH}/updatedAt`).set(Date.now());
}

// 9) Expandir/Contraer todo (manteniendo estado + clase)
$("#expandAll").addEventListener("click", ()=>{
  Object.keys(CATS).forEach(catLabel=>{
    OPEN[keyize(catLabel)] = true;
  });
  document.querySelectorAll(".cat").forEach(sec=>{
    sec.classList.remove("collapsed");
    const btn = sec.querySelector(".toggleBtn");
    if (btn) btn.textContent = "▾";
  });
});

$("#collapseAll").addEventListener("click", ()=>{
  Object.keys(CATS).forEach(catLabel=>{
    OPEN[keyize(catLabel)] = false;
  });
  document.querySelectorAll(".cat").forEach(sec=>{
    sec.classList.add("collapsed");
    const btn = sec.querySelector(".toggleBtn");
    if (btn) btn.textContent = "▸";
  });
});

// 10) Reiniciar día
$("#resetDay").addEventListener("click", async ()=>{
  if (!confirm("¿Reiniciar todo en blanco?")) return;
  const categories = {};
  Object.keys(CATS).forEach(catLabel=>{
    const catKey = keyize(catLabel);
    categories[catKey] = { title: catLabel, tasks:{} };
    CATS[catLabel].forEach(taskLabel=>{
      const taskKey = keyize(taskLabel);
      categories[catKey].tasks[taskKey] = { label: taskLabel, done:false, by:null, time:null };
    });
  });
  localNotifiedAllCovered = false;
  await db.ref(ROOT_PATH).update({
    categories,
    dateLabel: todayStr,
    updatedAt: Date.now(),
    allCoveredAt: null
  });
});

// 11) Aviso cuando TODAS las categorías tienen >= 1 tarea hecha
function maybeNotifyAllCovered(data){
  const categories = data.categories || {};
  const totalCats = Object.keys(CATS).length;

  let covered = 0;
  Object.keys(CATS).forEach(catLabel=>{
    const catKey = keyize(catLabel);
    const tasks = categories?.[catKey]?.tasks || {};
    const hasOne = Object.values(tasks).some(t => t && t.done);
    if (hasOne) covered++;
  });

  const allCovered = covered === totalCats;
  const alreadyStamped = !!data.allCoveredAt;

  if (allCovered && !alreadyStamped && !localNotifiedAllCovered){
    localNotifiedAllCovered = true;
    db.ref(`${ROOT_PATH}/allCoveredAt`).set(Date.now());
    alert("🎉 ¡Día cubierto! Cada categoría tiene al menos una tarea realizada. ¡Brutales!");
  }
}

// 12) Arranque
ensureInit().then(startLive);




























