LINE SCANNER PRO V18 — API-FOOTBALL
==================================

Esta versión corrige el diagnóstico de conexión de API-Football.

CAMBIOS PRINCIPALES
- Botón «Probar API Key» en Configuración.
- La prueba llama directamente a https://v3.football.api-sports.io/countries usando el header x-apisports-key.
- Muestra errores diferenciados: 401, 403, 429, errores devueltos por API-Football y fallos de red/CORS.
- Eliminado el uso de LOCAL_PROXY como valor de API key para el adaptador API-Football.
- Se conserva el diseño de estadio/neón de V15 y la arquitectura V16.

IMPORTANTE
- No incluye ninguna API key.
- No pongas la clave dentro del código ni la subas a GitHub.
- API-Football confirma que la autenticación usa el header x-apisports-key.
- Si tienes restricciones de IP o dominio en dashboard.api-football.com, deben permitir el sitio desde el que abres la aplicación.
- En GitHub Pages la clave queda visible en el navegador si se usa conexión directa. Para una publicación pública segura se recomienda un proxy/backend.
