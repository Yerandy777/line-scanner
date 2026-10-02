LINE SCANNER PRO V45.1 — SCANNER PRO RESOLVER + DECISION + LEARNING

Esta versión conserva la interfaz y el resto de módulos de V45 y corrige el motor de Scanner Pro.

Cambios principales:
- Parser de entradas con hándicap y línea asiática (incluye 2-2.5, +1.5-2, p-0.5).
- Resolución automática del fixture real para fútbol y deportes API-Sports con endpoint /games.
- Busca partido en vivo, próximo o ya finalizado y usa H2H como respaldo para partidos anteriores.
- Compara OVER, UNDER y HÁNDICAP cuando la línea corresponde.
- Selecciona una decisión basada en señales y datos disponibles; si no hay evidencia suficiente no inventa una selección.
- La decisión queda congelada automáticamente al crear el análisis.
- El marcador LIVE puede actualizarse sin reescribir la decisión congelada.
- Al finalizar, liquida automáticamente la selección congelada y alimenta el motor de aprendizaje.
- El aprendizaje usa solo resultados reales liquidados y patrones similares.
- Para deportes distintos de fútbol, usa /teams, /games y /games/statistics cuando el proveedor los expone.
- No requiere resultado manual.

IMPORTANTE:
La disponibilidad de datos depende de la API y de la cuota/clave configurada. Si el proveedor no devuelve el fixture o la estadística, Scanner Pro lo indica en lugar de fabricar datos.
