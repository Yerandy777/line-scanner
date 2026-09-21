LINE SCANNER PRO — GITHUB PAGES V2

Esta versión corrige el comportamiento de PWA/cache y añade "Probar API".
1. Sube todos los archivos a la raíz del repositorio.
2. GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).
3. Abre la URL HTTPS.
4. Pega tu API key en "API key" y pulsa "Probar API".
5. Si muestra HTTP 401, la clave es inválida/revocada o no tiene suscripción.
6. Si muestra HTTP 429, se agotó la cuota/límite.
7. Si muestra HTTP 403, el acceso fue denegado.
8. Si muestra "API conectada", pulsa "Conectar feed".

La clave se guarda en el almacenamiento local del dispositivo para no tener que pegarla cada vez.
IMPORTANTE: una API key usada directamente en una web pública puede ser visible para el usuario/navegador; no la publiques dentro del código.
