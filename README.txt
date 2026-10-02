LINE SCANNER PRO V45.2 — SCANNER PRO REAL FIX

Correcciones principales:
- Scanner Pro ya no limita el resolvedor a fútbol.
- Baloncesto, béisbol, hockey, rugby y otros endpoints API-Sports compatibles se resuelven buscando los juegos reales de los últimos 4 días.
- Si existe una API key en Configuración, se usa directamente para todos los deportes.
- Si no hay key, fútbol intenta usar el Worker configurado; otros deportes muestran error explícito en vez de fingir que procesaron el partido.
- El análisis no borra la entrada del usuario.
- Un fallo de API queda visible dentro del resultado con el motivo.
- Una decisión real con evidencia queda congelada automáticamente; el seguimiento LIVE/final continúa sin reescribirla.
- Liquidación automática al terminar.
- Aprendizaje solo con decisiones reales liquidadas.

IMPORTANTE:
La aplicación no puede obtener datos reales de un proveedor si no hay una fuente de datos válida. La versión anterior ocultaba este fallo y parecía que Scanner Pro simplemente no hacía nada. Esta versión deja el error explícito y usa la API key configurada cuando existe.
