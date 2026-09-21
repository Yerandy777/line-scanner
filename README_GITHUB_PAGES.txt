LINE SCANNER PRO — V5 FINAL

Esta versión fue revisada y probada antes de empaquetarse.

ARCHIVOS DE LA V5:
- index.html
- manifest.webmanifest
- sw.js
- icon.svg
- .nojekyll

CAMBIOS PRINCIPALES:
- Nombre de aplicación: Line Scanner Pro.
- PWA en pantalla completa y orientación vertical.
- Caché del Service Worker actualizado a v5 para evitar conservar la V2/V4 anterior.
- The Odds API como proveedor principal.
- Botón para comprobar la API.
- LIVE/próximos mediante /scores.
- Resultados de los últimos 3 días mediante daysFrom=3.
- Los resultados FINAL se cruzan con partidos ya analizados por ID o por equipos y, cuando hay fecha, por proximidad temporal.
- Si el partido ya tenía handicap/totales, el FINAL se contrasta contra esas líneas y las apuestas pendientes se liquidan automáticamente.
- Si sólo existe el resultado y no existe una línea pre-partido, el sistema NO inventa una línea histórica; muestra el FINAL y avisa de que falta la línea para análisis predictivo.
- Los partidos FINAL no desaparecen cuando se actualiza el feed de cuotas.
- Se conserva la liquidación exacta de líneas asiáticas divididas (+0.5/+1, 2.5/3, etc.).
- El motor automático interno fue actualizado a V3 y migra los datos anteriores del motor V2.
- La API key no se envía al chat; se usa desde el navegador del usuario.

GITHUB PAGES:
1. Elimina los archivos antiguos del repositorio.
2. Sube TODOS estos archivos directamente a la raíz del repositorio.
3. No subas el ZIP dentro del repositorio.
4. GitHub Pages: Branch main / (root).
5. Espera a que termine el despliegue.
6. Para cambiar el nombre de una instalación PWA antigua en iPhone, elimina la app vieja de la pantalla de inicio y vuelve a añadir la nueva desde el sitio publicado.

PRUEBAS REALIZADAS:
- Sintaxis JavaScript del HTML: OK.
- Sintaxis del Service Worker: OK.
- API simulada: conexión, carga de resultados, cruce con partido manual, FINAL 2-1 y liquidación automática: OK.
- Actualización del feed después de un FINAL sin perder el resultado: OK.
- Diagnóstico interno: 7/7 pruebas correctas.
