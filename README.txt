LINE SCANNER PRO V45.5 — SCANNER PRO QUOTA-SAFE VALUE ENGINE

Esta revisión corrige dos problemas concretos de V45.4 que podían dejar Scanner Pro en API ERROR, datos insuficientes y null%.

CORRECCIONES PRINCIPALES
- El resolver de fútbol ya no dispara 6 llamadas de búsqueda/formulario en paralelo. Primero consulta una sola ventana de fixtures (ayer → próximos 7 días) y busca el partido dentro de esa respuesta.
- Cuando encuentra el fixture, hace una única consulta de detalle por ID para reutilizar marcador, estado, eventos y estadísticas disponibles.
- Las cuotas son opcionales: si /odds falla, el análisis base del partido no se invalida.
- Se conserva un fallback de búsqueda por equipos solo cuando el fixture no aparece en la ventana inicial.
- Las probabilidades inexistentes nunca se muestran como null%; se muestran como —.
- Los errores de fuente se muestran explícitamente dentro de la tarjeta Scanner Pro.
- Se incorporan los marcadores de descanso para liquidar correctamente mercados de Primer Tiempo.
- Service Worker actualizado con cache nueva para evitar que el iPhone siga cargando una versión antigua de app.js.

LÍMITE API-FOOTBALL
El plan Free tiene límite de 10 solicitudes por minuto y 100 al día. El flujo anterior podía acercarse al límite en una sola búsqueda. Esta versión reduce drásticamente el número de llamadas del Scanner y usa cache.

CLOUDFLARE WORKER
El Worker incluido necesita el secret API_FOOTBALL_KEY configurado. /api/health no necesita la key y debe devolver ok:true.

MODELO
Scanner Pro compara la línea introducida, forma, H2H, marcador/estado, estadísticas disponibles y cuotas cuando existen. No inventa datos ni fuerza una apuesta si la evidencia no alcanza el umbral.
