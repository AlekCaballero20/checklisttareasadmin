// 1️⃣ Inicializa Firebase (con tu config)
const firebaseConfig = {
  apiKey: "AIzaSyA_ubaKFH-QTf2ckIjYkxr-OsLQK1sLfKg",
  authDomain: "cheklist-tareas-admin.firebaseapp.com",
  databaseURL: "https://cheklist-tareas-admin-default-rtdb.firebaseio.com",
  projectId: "cheklist-tareas-admin",
  storageBucket: "cheklist-tareas-admin.firebasestorage.app",
  messagingSenderId: "73174483631",
  appId: "1:73174483631:web:caa41ba359fbeb8d55ca5a"
};

// SDK compat (usa las librerías que ya tienes en index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2️⃣ Áreas definitivas de Musicala
const AREAS = [
  "Dirección",
  "Legal",
  "Contabilidad y Finanzas",
  "Gerencia y administración",
  "Recursos Humanos",
  "Seguridad y Salud en el Trabajo",
  "Organización y Servicios Generales",
  "Académico",
  "Atención al Cliente y Ventas",
  "Diseño y Marketing",
  "Programación (sistemas)",
  "Alianzas y convenios",
  "Acción Social y Comunitaria",
  "Investigación (Convocatorias)",
  "Seguridad y Supervisión",
  "Compras"
];

// 3️⃣ Utilidades básicas
const $ = (q) => document.querySelector(q);
const todayStr = new Date().toISOString().slice(0,10);
$("#today").textContent = todayStr;

const ROOT_PATH = "checklistCurrent"; // ruta en la DB

// 4️⃣ Inicializar si no existe
async function ensureInit(){
  const snap = await db.ref(ROOT_PATH).get();
  if (!snap.exists()) {
    const areasObj = {};
    AREAS.forEach(a => areasObj[a] = { done:false, by:null, time:null });
    await db.ref(ROOT_PATH).set({
      dateLabel: todayStr,
      areas: areasObj,
      updatedAt: Date.now()
    });
  } else {
    // Si agregan nuevas áreas
    const val = snap.val();
    const areas = val.areas || {};
    let changed = false;
    AREAS.forEach(a=>{
      if(!(a in areas)){
        areas[a] = { done:false, by:null, time:null };
        changed = true;
      }
    });
    if (changed) await db.ref(`${ROOT_PATH}/areas`).set(areas);
  }
}

// 5️⃣ Escuchar cambios en tiempo real
function startLive(){
  db.ref(ROOT_PATH).on("value", (snap)=>{
    const data = snap.val();
    if (!data) return;
    renderList(data.areas || {});
    updateProgress(data.areas || {});
  });
}

// 6️⃣ Renderizar la lista
function renderList(areas){
  const list = $("#list");
  list.innerHTML = "";
  const tmpl = $("#itemTmpl");

  AREAS.forEach((name)=>{
    const info = areas[name] || { done:false, by:null, time:null };
    const frag = tmpl.content.cloneNode(true);
    const chk  = frag.querySelector(".chk");
    const area = frag.querySelector(".area");
    const byEl = frag.querySelector(".by");
    const tEl  = frag.querySelector(".time");

    area.textContent = name;
    chk.checked = !!info.done;
    byEl.textContent = info.by ? `Hecho por: ${info.by}` : "—";
    tEl.textContent  = info.time ? new Date(info.time).toLocaleTimeString() : "";

    chk.addEventListener("change", async ()=>{
      const who = $("#who").value;
      await updateArea(name, chk.checked ? who : null);
    });

    list.appendChild(frag);
  });
}

// 7️⃣ Actualizar barra de progreso
function updateProgress(areas){
  const total = AREAS.length;
  const done = AREAS.reduce((acc,n)=> acc + (areas[n]?.done ? 1 : 0), 0);
  const pct = total ? Math.round((done/total)*100) : 0;
  $("#progFill").style.width = pct + "%";
  $("#progPct").textContent = pct + "%";
  $("#progDetail").textContent = `${done} de ${total}`;
}

// 8️⃣ Guardar cambios en Firebase
async function updateArea(areaName, who){
  const isDone = !!who;
  await db.ref(`${ROOT_PATH}/areas/${areaName}`).set({
    done: isDone,
    by: isDone ? who : null,
    time: isDone ? Date.now() : null
  });
  await db.ref(`${ROOT_PATH}/updatedAt`).set(Date.now());
}

// 9️⃣ Botón para reiniciar día
$("#resetDay").addEventListener("click", async ()=>{
  if (!confirm("¿Reiniciar los checks de hoy?")) return;
  const areasObj = {};
  AREAS.forEach(a => areasObj[a] = { done:false, by:null, time:null });
  await db.ref(ROOT_PATH).update({
    areas: areasObj,
    dateLabel: todayStr,
    updatedAt: Date.now()
  });
});

// 🔟 Arrancar todo
ensureInit().then(startLive);
