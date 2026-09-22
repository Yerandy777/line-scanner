LINE SCANNER PRO V13 — GITHUB PAGES

Sube a la raíz del repositorio, exactamente estos archivos:
- index.html
- manifest.webmanifest
- sw.js
- icon.svg
- icon-180.png
- icon-512.png

GitHub Pages:
Settings -> Pages -> Deploy from a branch -> main -> / (root)

URL:
https://yerandy777.github.io/line-scanner/

API:
- La aplicación usa una sola clave visible para el usuario: The Odds API.
- La clave se introduce como contraseña dentro de Configuración.
- No se guarda en localStorage ni se incluye en estos archivos.
- Scanner 01 descubre automáticamente competiciones/eventos de fútbol.
- Los resultados recientes se consultan con /scores cuando hace falta.
- Los eventos se cachean temporalmente para evitar peticiones duplicadas.
- El monitor agrupa actualizaciones por competición para reducir consumo.

Importante:
- No abras index.html con doble clic (file://) para probar el feed; GitHub Pages lo sirve por HTTPS y The Odds API soporta CORS.
- La clave sigue siendo visible para el navegador durante las peticiones; no la publiques ni la subas a GitHub.
