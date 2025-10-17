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

// 2) Definición de CATEGORÍAS y SUBTAREAS (ajusta lo que quieras)
const CATS = {
  "Alianzas y convenios": [
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
  ],
  "Dirección": [
    "Revisión de prioridades del día",
    "Seguimiento a indicadores clave",
    "Aprobación de decisiones urgentes"
  ],
  "Legal": [
    "Verificación de contratos vigentes",
    "Revisión de documentos para firma",
    "Seguimiento trámites (cámaras/SEC)"
  ],
  "Contabilidad y Finanzas": [
    "Flujo de caja del día",
    "Pagos o ingresos registrados",
    "Conciliación rápida (bancos y ventas)"
  ],
  "Gerencia y administración": [
    "Agenda y delegación del día",
    "Revisión de bandeja (pendientes críticos)",
    "Compra menor / gestiones administrativas"
  ],
  "Recursos Humanos": [
    "Novedades de nómina",
    "Contratación / afiliaciones pendientes",
    "Comunicación con equipo (avisos)"
  ],
  "Seguridad y Salud en el Trabajo": [
    "Chequeo programaciones Safe Mode",
    "Verificación de incidentes / novedades",
    "Tareas SG-SST programadas hoy"
  ],
  "Organización y Servicios Generales": [
    "Aseo y orden de espacios",
    "Inventario básico (papelería / limpieza)",
    "Solicitudes de mantenimiento"
  ],
  "Académico": [
    "Programación de clases / ajustes",
    "Seguimiento a docentes y novedades",
    "Materiales / recursos para la jornada"
  ],
  "Atención al Cliente y Ventas": [
    "Mensajes/WhatsApp y correos respondidos",
    "Seguimiento a leads calientes",
    "Agendamiento / confirmación de citas"
  ],
  "Diseño y Marketing": [
    "Publicación / Historia del día",
    "Pieza o copy prioritario listo",
    "Revisión de campañas activas"
  ],
  "Programación (sistemas)": [
    "Revisión de bugs reportados",
    "Deploy / cambios urgentes",
    "Backups / chequeos básicos"
  ],
  "Acción Social y Comunitaria": [
    "Contacto con comunidad/centros",
    "Seguimiento a casos especiales",
    "Registro de acciones del día"
  ],
  "Investigación (Convocatorias)": [
    "Búsqueda o lectura (15 min)",
    "Actualizar requisitos / documentos",
    "Cronograma / fechas al día"
  ],
  "Seguridad y Supervisión": [
    "Revisión de accesos / llaves",
    "Checklist de equipos (mínimo)",
    "Observaciones de seguridad anotadas"
  ],
  "Compras": [
    "Revisión de necesidades urgentes",
    "Cotización / compra menor",
    "Registro de factura / soporte"
  ]
};

// 3) Utils generales
const $ = (q) => document.querySelector(q);
const todayStr = new Date().toISOString().slice(0,10);
$("#today").textContent = todayStr;

// RTDB no permite . # $ / [ ]
const keyize = (s) => s
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[.#$/\[\]]/g, "_")
  .replace(/\s+/g, "_")
  .toLowerCase();

const ROOT_PATH = "checklistCurrentV2";

// Estado de UI: qué categorías están abiertas
const OPEN = {}; // { [catKey]: true | false }

// Para no duplicar el aviso de “todas cubiertas”
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
      allCoveredAt: null // timestamp cuando todas las categorías tengan al menos 1 tarea
    });
  } else {
    // Patch por si agregaste/renombraste tareas o categorías en CATS
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
    maybeNotifyAllCovered(data); // <-- chequea si ya cubrieron todas las categorías
  });
}

// 6) Render de categorías y tareas (respeta estado OPEN)
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
      timeEl.textContent = info.time ? new Date(info.time).toLocaleTimeString() : "";

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

    // Estado de apertura
    const isOpen = OPEN[catKey] ?? false;
    if (isOpen) {
      tasksEl.removeAttribute("hidden");
      toggle.textContent = "▾";
    } else {
      tasksEl.setAttribute("hidden", "");
      toggle.textContent = "▸";
    }

    toggle.addEventListener("click", ()=>{
      const nowOpen = !(OPEN[catKey] ?? false);
      OPEN[catKey] = nowOpen;
      if (nowOpen) {
        tasksEl.removeAttribute("hidden");
        toggle.textContent = "▾";
      } else {
        tasksEl.setAttribute("hidden", "");
        toggle.textContent = "▸";
      }
    });

    wrap.appendChild(catNode);
  });
}

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

// 9) Expandir/Contraer todo (manteniendo estado)
$("#expandAll").addEventListener("click", ()=>{
  Object.keys(CATS).forEach(catLabel=>{
    OPEN[keyize(catLabel)] = true;
  });
  document.querySelectorAll(".tasks").forEach(el=> el.removeAttribute("hidden"));
  document.querySelectorAll(".toggleBtn").forEach(btn=> btn.textContent = "▾");
});
$("#collapseAll").addEventListener("click", ()=>{
  Object.keys(CATS).forEach(catLabel=>{
    OPEN[keyize(catLabel)] = false;
  });
  document.querySelectorAll(".tasks").forEach(el=> el.setAttribute("hidden",""));
  document.querySelectorAll(".toggleBtn").forEach(btn=> btn.textContent = "▸");
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
  localNotifiedAllCovered = false; // resetea aviso local
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

  // Si todas las categorías están cubiertas y aún no notificamos hoy, avisamos.
  const allCovered = covered === totalCats;
  const alreadyStamped = !!data.allCoveredAt;

  if (allCovered && !alreadyStamped && !localNotifiedAllCovered){
    localNotifiedAllCovered = true; // evita dobles alerts en este cliente
    // Guarda una marca para que en otros clientes no se duplique el aviso
    db.ref(`${ROOT_PATH}/allCoveredAt`).set(Date.now());
    // Mensaje (simple). Puedes cambiar por un banner si quieres.
    alert("🎉 ¡Día cubierto! Cada categoría tiene al menos una tarea realizada. Buenísimo, equipo Musicala.");
  }
}

// 12) Arranque
ensureInit().then(startLive);

