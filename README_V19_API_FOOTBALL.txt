LINE SCANNER PRO V19 — API-FOOTBALL

Corrección profunda de autenticación y proveedor.

Proveedor único: API-Football v3
Base: https://v3.football.api-sports.io/
Autenticación: header x-apisports-key
Prueba de autenticación: /status
Feed: /fixtures
Cuotas: /odds?fixture=ID

La V19 elimina el uso operativo de The Odds API del feed, marcadores, mercados y Scanner 01. La API key se toma únicamente del campo de Configuración durante la sesión y no se guarda en localStorage.

IMPORTANTE: no publiques la API key en GitHub. Para una app pública, lo más seguro es usar un backend/proxy que mantenga la clave fuera del navegador.
