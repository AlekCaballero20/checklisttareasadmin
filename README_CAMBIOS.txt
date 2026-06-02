Radar Gerencial — Musicala

Cambios principales:

1. Se transformó la checklist en un radar gerencial para Alek y Cata.
2. El avance principal ahora mide cobertura de áreas, no solo tareas completadas.
3. Se agregaron estadísticas superiores: cobertura, avance, áreas sin tocar, alta prioridad, tareas de Alek y tareas de Cata.
4. Se agregó panel de sugerencias inteligentes:
   - Siguiente jugada sugerida.
   - Sugerencia específica para Alek.
   - Sugerencia específica para Cata.
   - Último movimiento realizado.
5. Se agregó actividad reciente con las últimas tareas realizadas.
6. Se agregó mapa rápido de frentes de empresa para abrir cada área.
7. Se agregaron filtros: todo, pendientes, completadas, áreas sin tocar, alta prioridad, hechas por Alek y hechas por Cata.
8. Se agregó buscador por tarea, área, responsable o nota.
9. Cada tarea ahora tiene prioridad automática: alta, media o baja.
10. Cada tarea permite guardar una nota rápida en Firebase.
11. El botón “Nuevo día” archiva el radar actual en Firebase antes de reiniciar.
12. Se usa fecha local de Colombia para evitar errores por UTC.
13. Se mejoró la interfaz visual con logo, tarjetas, paneles y vista responsive.

Notas técnicas:

- La app sigue usando Firebase Realtime Database.
- No se agregó login porque el flujo está pensado solo para Alek y Cata.
- La nueva ruta principal en Firebase es:
  checklistCurrentV3_radarGerencial
- El historial se guarda en:
  checklistHistoryV3_radarGerencial
- La configuración pública de Firebase se mantiene en app.js, como en el proyecto original.
- Importante: las reglas de Firebase deben estar protegidas si el enlace queda público.

Uso sugerido:

1. Al iniciar el día, cada uno selecciona si marca como Alek o Cata.
2. No intenten completar absolutamente todo. La meta inicial es que todos los frentes tengan al menos una acción.
3. Revisen primero la sugerencia principal.
4. Si Cata hizo una tarea en un área, Alek puede tomar otra área sugerida, y viceversa.
5. Usen las notas para dejar contexto breve, no novelas administrativas.
6. Al final del día, usen “Nuevo día” para archivar y reiniciar.
