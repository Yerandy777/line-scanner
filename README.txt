LINE SCANNER PRO V45 · REAL DATA / LIVE / SCANNER

IMPORTANTE
1. Sube el contenido de este ZIP a la raiz de GitHub Pages.
2. index.html debe quedar en la raiz.
3. Cloudflare Worker: usa worker.js como codigo del Worker.
4. En Cloudflare > Settings > Variables and Secrets crea el secreto:
   API_FOOTBALL_KEY = TU_CLAVE_DE_API-FOOTBALL
5. El navegador NO necesita la API key.
6. Worker URL esperada por index.html:
   https://flat-term-e886.soleryerandy7.workers.dev

CORRECCIONES V45
- Futbol usa /fixtures, no /games.
- Scanner busca equipos y el fixture real, incluyendo partidos finalizados.
- Live usa /fixtures?live=all.
- Estadisticas live usa /fixtures/statistics.
- Forma/H2H usan /fixtures.
- Finalizados consulta fechas reales.
- La API key queda en Cloudflare, no en el HTML.
- Cache del Worker reduce solicitudes repetidas.
- El Scanner conserva la linea original, identifica estado LIVE/FINAL y liquida automaticamente.

LIMITACION ACTUAL
Esta conexion V45 usa API-Football para futbol. Los demas deportes del HTML no quedan convertidos automaticamente a API-Football porque son APIs distintas.
