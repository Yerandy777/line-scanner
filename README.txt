LINE SCANNER PRO V21 · SCANNER 01 INTELLIGENCE

Cambios principales:
- Scanner 01 ya no usa un catálogo de partidos para decidir qué analizar.
- Solo procesa las líneas que introduce el usuario.
- Soporta hándicap del visitante con formato "p-0.5 Equipo", "-0.5 Equipo" y "Equipo-0.5".
- Soporta líneas de goles: 0, 0.5, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5 y cualquier valor numérico válido.
- Soporta rangos como 2-2.5.
- Puede registrar cuota decimal con @1.90.
- Puede registrar marcador final con => 2-1.
- Puede usar una fecha al principio [2026-09-22]: para intentar localizar un resultado histórico en API-Football.
- Guarda memoria propia de Scanner 01 en localStorage separado.
- Predicciones IA y Estadísticas IA se alimentan de esa memoria propia.
- Usa suavizado estadístico para evitar sobre-reaccionar a muestras pequeñas.
- Separa línea exacta, líneas vecinas, mismo enfrentamiento y recencia.
- Liquida hándicap asiático y líneas de goles, incluidos cuartos.
- Mantiene el resto de funciones de Line Scanner Pro y el motor LIVE API-Football V20.

Ejemplo:
Real Santander vs p-0.5 Orsomarso (2-2.5)
Tigres vs Atlético (2)
Internacional vs Independiente (2)

Opcional:
Equipo A vs -0.75 Equipo B (2.75) @1.90 => 2-1

La app no garantiza resultados. El objetivo del motor es medir evidencia, calibración y estabilidad de los datos introducidos.
