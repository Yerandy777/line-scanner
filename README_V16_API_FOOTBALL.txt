LINE SCANNER PRO V16 — API-FOOTBALL

Proveedor principal: API-Football / API-Sports v3.
Base: https://v3.football.api-sports.io/
Autenticación: header x-apisports-key.

La API key NO está incluida en este ZIP. El usuario la introduce en Configuración.

FUNCIONES CONECTADAS
- LIVE: /fixtures?live=all
- Partidos del día: /fixtures?date=YYYY-MM-DD
- Resultados recientes: /fixtures?date=...
- Ligas: /leagues?season=YYYY
- Cuotas prepartido del partido seleccionado: /odds?fixture=ID
- Estadísticas detalladas pueden ampliarse con /fixtures/statistics?fixture=ID
- Eventos del partido: /fixtures/events?fixture=ID
- Predicciones API-Football: /predictions?fixture=ID

IMPORTANTE
La V16 conserva el motor de análisis, liquidación, memoria, favoritos y diseño de V15.
Se añadió un adaptador que traduce las respuestas de API-Football al formato interno que ya utilizaba Line Scanner Pro.
No se incluye ninguna API key real.

LIGA PREDETERMINADA
39 = Premier League. También se aceptan IDs numéricos de API-Football.

SEGURIDAD
En GitHub Pages la API key se envía desde el navegador y puede ser visible para quien inspeccione la aplicación. Para una publicación pública conviene usar un proxy/backend propio y restricciones de clave cuando estén disponibles.
