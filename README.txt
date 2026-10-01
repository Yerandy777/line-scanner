LINE SCANNER PRO V45 · REAL LIVE FIX

BASE: LINE-SCANNER-PRO-V45-REAL-LIVE-FIX.zip

Se conserva la interfaz y funciones existentes de V45. Reparaciones incluidas:
- Scanner Pro reconoce prefijos de deporte (NBA, MLB, NHL, F1, etc.) y conserva la entrada original.
- Resolución real del fixture para fútbol y deportes compatibles con API-Sports.
- Prioridad LIVE > FINALIZADO > PRÓXIMO al localizar un partido.
- Búsqueda por fechas actuales y recientes para encontrar partidos ya terminados.
- Marcadores genéricos corregidos para baloncesto/béisbol/hockey/etc.
- Seguimiento LIVE y estadísticas cuando el proveedor las entrega.
- Finalizados ampliado a multideporte.
- Service Worker/cache versionado para evitar que iPhone cargue una V45 antigua.
- No se eliminan las demás pantallas ni el diseño de V45.

IMPORTANTE: para deportes distintos de fútbol se necesita una API key de API-Sports válida en Configuración; fútbol puede usar el Worker configurado.

REVISIÓN 2026-10-01 · SCANNER DECISION ENGINE
- La decisión compara HÁNDICAP / OVER / UNDER antes de elegir una sola opción.
- Las señales de porcentaje del Scanner usan la probabilidad estimada del candidato, no un porcentaje arbitrario de interfaz.
- Se aplica un umbral de decisión: si la evidencia no alcanza el mínimo, el resultado es SIN APUESTA.
- La decisión ya no se marca como congelada automáticamente; se congela con el botón CONGELAR DECISIÓN.
- La resolución de fútbol prioriza consultas por equipos y reduce descargas masivas por fecha; mantiene un fallback por fecha.
- Cloudflare Worker sigue siendo el puente de fútbol y conserva API_FOOTBALL_KEY como secreto.
- No se incluyen claves secretas en este ZIP.
