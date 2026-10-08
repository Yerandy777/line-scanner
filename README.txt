LINE SCANNER PRO V47.0 · MATCH INTELLIGENCE

Objetivo
- Reemplaza únicamente el apartado Scanner Pro por un motor orientado a: fixture real, estado real, análisis previo, decisión y aprendizaje de patrones.
- Mantiene el resto de la aplicación y sus secciones.

Cambios principales
1. index.html usa app.js como motor canónico; se eliminó el motor JS inline duplicado que podía dejar al teléfono ejecutando una versión anterior.
2. Scanner Pro 3.0 muestra estado, marcador/tiempo, línea, hándicap, decisión, confianza, evidencia, lectura LIVE y patrones históricos.
3. Parser mantiene el lado del hándicap tal como fue introducido.
4. Resolución de fútbol optimizada para consumir menos API:
   - búsqueda de equipos (con caché 24 h)
   - búsqueda estrecha de fixture
   - detalle del fixture (incluye datos embebidos cuando están disponibles)
   - últimas formas de ambos equipos con caché
   - predictions como evidencia secundaria
5. El Worker añade /api/predictions con caché largo.
6. Ante 429 no se hace fallback inmediato a otra llamada que pueda empeorar la cuota.
7. El aprendizaje solo usa análisis reales ya liquidados; DEMO no entra.
8. Service Worker actualizado a V47 para evitar caché del motor antiguo.

Pruebas realizadas
- node --check app.js: PASS
- node --check worker.js: PASS
- integridad del ZIP: PASS
- parser: 8 casos críticos PASS
- liquidación Over/Under cuarto: PASS
- liquidación hándicap: PASS
- comprobaciones estáticas de integración index/app/worker/SW: PASS

Nota de API
La API-Football limita las peticiones por minuto según el plan y devuelve 429 cuando se supera ese límite. El motor V47 reduce llamadas y usa caché, pero no puede aumentar la cuota de una cuenta externa.
