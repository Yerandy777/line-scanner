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


V45.6 — AUDITORÍA Y CORRECCIÓN PROFUNDA
- index.html y app.js quedan sincronizados; index.html es el archivo que ejecuta la aplicación.
- Scanner Pro ya no permite que las cuotas 1X2/BTTS sustituyan la decisión solicitada HÁNDICAP/OVER/UNDER.
- Se obtiene forma reciente real por equipo y H2H cuando el fixture se identifica; los resultados se cachean.
- En LIVE se solicitan explícitamente estadísticas y eventos del fixture para tiros, tiros a puerta, corners, posesión, tarjetas y secuencia de goles cuando el proveedor los entrega.
- El modelo de totales usa una distribución de Poisson y el hándicap usa distribución conjunta de goles; las cuotas son evidencia secundaria.
- Si falta evidencia, se muestra la carencia de fuente/datos; no se fabrican porcentajes.
- Se conserva la liquidación automática y el aprendizaje únicamente con resultados reales cerrados.
