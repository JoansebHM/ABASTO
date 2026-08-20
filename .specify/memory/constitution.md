<!-- Sync Impact Report
Version change: 1.2.0 -> 1.3.0
Modified principles: None
Added sections: None
Removed sections: None
Follow-up TODOs: TODO(RATIFICATION_DATE): confirmar fecha de ratificación oficial
-->

# ABASTO Constitution

## Core Principles

### I. Trazabilidad Total

Todo movimiento de un recurso dentro del sistema DEBE quedar registrado de forma
inmutable, desde su origen hasta su destino final. Ningún suministro puede
desaparecer ni aparecer en el sistema sin una transacción que lo explique.
Esto aplica por igual a:

- Envíos de donante a punto de acopio.
- Transferencias entre puntos de acopio, tanto en Zona de Recolección como en
  Zona de Desastre.
- Ayuda externa registrada manualmente por un líder cuando un donante entrega
  directamente en sitio.

Cada transacción DEBE conservar origen, destino, responsable de registro,
marca de tiempo, contenido declarado y estado. El historial de transacciones
NUNCA se edita ni se borra; las correcciones se hacen mediante nuevas
transacciones de ajuste que referencian la original. Esta regla es central
porque la trazabilidad es la razón de ser de ABASTO: sin ella, el sistema no
cumple su propósito de orientar recursos con evidencia.

### II. Inventario como Fuente de Verdad

El inventario disponible de un punto de acopio refleja únicamente recursos
confirmados como recibidos. Un envío en tránsito NUNCA incrementa el
inventario disponible del destino ni lo decrementa prematuramente del origen
más allá de moverlo a un estado intermedio de comprometido o en tránsito. Solo
cuando el líder receptor marca la tanda como recibida el sistema actualiza el
inventario real. Esta regla evita decisiones de despacho basadas en recursos
que aún no han llegado físicamente.

### III. Identidad Verificada de Líderes, Acceso Abierto para Donantes

El sistema DEBE mantener una asimetría deliberada de fricción según el rol:

- Los líderes de acopio en Zona de Desastre o Zona de Recolección DEBEN pasar
  por verificación con reconocimiento facial, documento de identidad y
  documento que certifique su cargo o rol comunitario antes de registrar
  puntos, inventario o transacciones.
- Los administradores generales se crean exclusivamente de forma manual por el
  equipo de desarrollo u operación; no existe autoregistro para ese rol.
- Los donantes NO requieren identificación ni cuenta para consultar el mapa,
  ver puntos de acopio y ver disponibilidad.

Ninguna funcionalidad de escritura puede ser accesible a un usuario no
verificado.

### IV. Evidencia Dual

Todo envío o transferencia DEBE incluir dos formas de evidencia
complementarias, no intercambiables entre sí:

1. Evidencia fotográfica que muestre de forma general lo que se está enviando,
   suficiente para verificar coherencia visual entre lo declarado y lo que
   efectivamente se despacha.
2. Registro textual estructurado con detalle preciso y cuantificado de tipo de
   recurso, cantidad y unidad, que sea la fuente para inventario y reportes.

La foto sin el registro textual, o viceversa, se considera una transacción
incompleta y el sistema DEBE impedir su confirmación hasta contar con ambas.

### V. Offline-First para Líderes en Zona de Desastre

Los líderes de punto de acopio en Zona de Desastre operan bajo conectividad
nula o intermitente. El sistema DEBE permitir registrar inventario, marcar
recepciones y generar ayuda externa completamente offline, con sincronización
automática y sin pérdida de datos en cuanto se recupere la señal. Los
conflictos de sincronización DEBEN resolverse de forma explícita y auditable,
nunca sobrescribiendo silenciosamente. Este requisito no se extiende por
defecto a líderes de Zona de Recolección, administradores ni a la vista
pública de donantes.

### VI. Red de Transferencias sin Fricción para el Donante

El modelo de flujo de recursos es una red, no una jerarquía lineal: cualquier
punto de acopio puede transferir excedentes a cualquier otro punto que los
necesite, sin importar su tipo. Para el donante, la experiencia se mantiene
simple: solo necesita saber a qué punto ir y qué se necesita ahí; nunca debe
operar la lógica de redistribución entre líderes. Cuando un donante entrega de
forma directa en un punto, esa entrega se registra como ayuda externa,
distinguible de las transferencias internas.

### VII. ABASTO No Es Logística de Transporte

El sistema registra y certifica el estado de los recursos, pero DEBE excluir
la gestión y optimización del transporte físico, incluyendo rutas, vehículos,
conductores y tiempos estimados de llegada. Cualquier funcionalidad que empuje
el producto hacia logística de transporte DEBE rechazarse o derivarse a un
sistema externo. Esta restricción protege la simplicidad del producto y evita
que la complejidad logística contamine el objetivo central.

### VIII. Multi-Desastre Concurrente por Diseño

El sistema DEBE soportar múltiples eventos o desastres activos de forma
simultánea e independiente, sin acoplar el modelo de datos a un único evento.
Todo punto de acopio, transacción y reporte DEBE poder asociarse a un evento
específico, y las consultas de mapa, disponibilidad y necesidades DEBEN poder
filtrarse por evento. Ninguna decisión de diseño puede asumir que solo existe
un desastre a la vez.

### IX. Privacidad y Manejo de Datos Sensibles

Los documentos de identidad y los datos de reconocimiento facial de los
líderes son información sensible y DEBEN tratarse con controles de acceso
estrictos. Su uso es exclusivo para verificación, el acceso queda restringido a
administradores y nunca se exponen en vistas públicas ni de donantes. La
verificación de identidad es un medio para garantizar confianza, no un fin para
exhibir datos personales.

### X. Seguridad por Diseño

La seguridad no es una capa final; es un criterio de diseño en cada
especificación, plan y tarea. Esto implica, como mínimo:

- Autenticación y autorización estrictas por rol: cada endpoint, función o
  política de datos DEBE validar explícitamente qué rol puede ejecutarla. El
  acceso por omisión está prohibido.
- Row Level Security obligatorio: al usar Supabase como backend, toda tabla
  con datos sensibles o específicos de rol DEBE tener políticas RLS activas
  desde su creación.
- Protección de datos de verificación: documentos de identidad, imágenes de
  reconocimiento facial y documentos de certificación de cargo DEBEN
  almacenarse en storage privado, con URLs firmadas de vida corta cuando se
  requiera acceso puntual.
- Integridad de evidencia y trazabilidad: las transacciones y su evidencia
  DEBEN protegerse contra alteración posterior; cualquier corrección se hace
  con nuevas transacciones vinculadas.
- Validación de entradas: toda entrada de usuario se valida tanto en cliente
  como en servidor; la validación de cliente es solo UX.
- Manejo de secretos: llaves, tokens y credenciales NUNCA se exponen en el
  cliente más allá de lo que el modelo de seguridad de Supabase permita.
- Auditoría de acciones sensibles: creación y verificación de líderes,
  confirmaciones de recepción y transferencias entre puntos DEBEN quedar
  asociadas de forma inmutable al usuario autenticado que las ejecutó.

Cualquier especificación nueva DEBE declarar explícitamente su modelo de
acceso antes de pasar a plan.

### XI. Idioma: Especificaciones en Español, Código en Inglés

Para mantener coherencia con el equipo y con el estándar de la industria:

- Todos los artefactos de especificación generados con Spec Kit DEBEN
  redactarse en español.
- Todo el código fuente, incluyendo nombres de variables, funciones, clases,
  componentes, tablas, columnas, commits y comentarios de código, DEBE
  escribirse en inglés.
- Los textos visibles para el usuario final se tratan como contenido de
  producto; su idioma por defecto es español, pero se implementan mediante
  mecanismos de internacionalización y no con textos hardcodeados.
- Ninguna tarea de implementación puede justificar mezclar idiomas dentro del
  código.

## Stack Tecnológico Inicial

Esta sección fija las tecnologías base aprobadas para el desarrollo de ABASTO.
Cualquier cambio o adición tecnológica relevante DEBE tratarse como una
enmienda a esta constitución, no como una decisión aislada dentro de un plan
de implementación.

**Frontend**:

- React + Vite + TypeScript como base de la aplicación.
- Zustand para el manejo de estado global de cliente.
- TanStack Query para estado de datos remotos, caché y sincronización.
- React Hook Form para manejo y validación de formularios.
- Tailwind CSS para estilos.
- Axios como cliente HTTP para integraciones que no pasen por el SDK de
  Supabase.
- Geovisor como componente base para visualización geoespacial de puntos de
  acopio y capas relacionadas.
- MapLibre para renderizado de mapas interactivos y navegación cartográfica en
  cliente.
- Turf.js para operaciones geoespaciales del frontend, incluyendo cálculos,
  filtros y transformaciones de geometrías requeridas por la experiencia de
  mapa.
- Lucide React como librería estándar de íconos de interfaz.

**Backend y Base de Datos**:

- Supabase como plataforma integral: Postgres, Auth, Storage, Realtime y Edge
  Functions, consumida mediante el SDK oficial.
- Postgres vía Supabase como base de datos relacional, con RLS activo por
  defecto.
- Supabase Storage para evidencia fotográfica y documentos de verificación,
  con buckets privados para datos sensibles.
- Supabase Realtime puede usarse para reflejar cambios de inventario o estado
  en el mapa cuando la conectividad lo permita.

Cualquier especificación o plan que proponga una tecnología fuera de este
stack DEBE justificar por qué el stack aprobado no cubre la necesidad antes de
introducirla.

## Restricciones Adicionales

- Estados de transacción válidos: toda transacción de recursos debe transitar
  únicamente por los estados definidos, sin saltos ni estados ad hoc fuera de
  especificación.
- Fuente única de verdad del inventario: no se permiten cálculos de
  disponibilidad derivados fuera del motor de transacciones central.
- Accesibilidad del mapa público: la consulta de puntos de acopio y su
  disponibilidad debe permanecer accesible sin fricción de registro para
  cualquier persona.

## Flujo de Desarrollo

Todo feature nuevo DEBE originarse como una especificación antes de
implementarse. Ninguna especificación puede contradecir un principio central
de esta constitución; si una especificación requiere hacerlo, la constitución
DEBE enmendarse primero, de forma versionada, antes de proceder. Los planes de
implementación y las tareas derivadas DEBEN verificar cumplimiento contra los
principios centrales antes de pasar a implement.

## Flujo de Trabajo en Equipo

Para evitar que el trabajo de una persona sobrescriba o entre en conflicto con
el de otra, el equipo DEBE seguir estas reglas:

- **Un branch por feature**: cada feature generada con Spec Kit vive en su
  propio branch (el que Spec Kit crea automáticamente, ej. `001-nombre-feature`).
  Nadie trabaja directo sobre `main`.
- **Ninguna task se marca como paralelizable si comparte archivos con otra
  task activa**: antes de repartir tasks entre personas, se revisa qué
  archivos toca cada una (`tasks.md` los lista). Si dos tasks tocan el mismo
  archivo, se ejecutan de forma secuencial y coordinada, nunca al mismo tiempo
  por dos personas distintas.
- **Pull Request obligatorio antes de integrar a `main`**: ningún cambio se
  mezcla sin al menos una revisión. El PR es el punto donde git muestra
  automáticamente si hay conflictos de código antes de que lleguen a `main`.
- **Sincronización frecuente**: cada persona actualiza su branch contra
  `main` (pull/rebase) con regularidad mientras trabaja, para detectar
  conflictos temprano y no acumular divergencia grande entre branches.
- **Migraciones de base de datos (Supabase) se coordinan explícitamente**:
  al ser el punto más propenso a conflictos reales (no solo de texto, sino de
  lógica), toda migración nueva se anuncia al equipo antes de crearse, se
  numera/timestampa de forma secuencial, y no se crean dos migraciones en
  paralelo sin coordinación previa.
- **Nadie resuelve un conflicto de merge en silencio**: si aparece un
  conflicto entre el trabajo de dos personas, se resuelve en conversación
  directa entre ambas (o con quien revisa el PR), nunca eligiendo una versión
  arbitrariamente sin entender el impacto en la otra task.

## Pruebas Automatizadas y CI/CD

La calidad y seguridad del código no dependen de la revisión manual
únicamente: todo cambio DEBE pasar por un pipeline automatizado antes de
integrarse.

- **Prohibido el push directo a `main`**: `main` solo recibe cambios a través
  de un Pull Request desde `develop` (o desde un branch de hotfix en caso de
  emergencia), nunca mediante push directo. La rama `main` DEBE estar
  protegida a nivel de repositorio para impedir esto técnicamente, no solo
  por acuerdo de equipo.
- **Prohibido el push directo a `develop`**: de igual forma, `develop` solo
  recibe cambios mediante Pull Request desde branches de feature. Esto
  garantiza que ningún cambio llega a la rama de integración sin pasar por
  el pipeline y sin revisión.
- **Pipeline obligatorio en cada Pull Request**, que como mínimo DEBE
  ejecutar:
  - **Lint y type-check**: validación de estilo y tipos de TypeScript.
  - **Build**: el proyecto DEBE compilar exitosamente antes de poder
    mergearse.
  - **Pruebas automatizadas**: tests unitarios y/o de integración DEBEN
    ejecutarse y pasar en su totalidad. Ningún PR se mergea con tests en
    rojo.
  - **Verificación de conflictos de merge**: el pipeline DEBE confirmar que
    el branch está actualizado y sin conflictos contra su rama destino antes
    de permitir el merge.
- **Cobertura mínima de pruebas por capa**:
  - **Frontend**: pruebas unitarias de componentes y lógica crítica (ej.
    validaciones de formularios, stores de Zustand) con Vitest + Testing
    Library.
  - **Base de datos (Postgres/Supabase)**: pruebas sobre funciones, triggers
    y políticas RLS críticas (ej. que el inventario efectivamente no se
    actualice hasta `recibido`, que un líder no pueda leer/editar puntos que
    no le pertenecen), mediante pgTAP o pruebas de integración equivalentes.
  - **Edge Functions**: pruebas de integración que validen el comportamiento
    esperado (ej. que la verificación de identidad rechace/apruebe según
    corresponda) antes de desplegarse.
- **Prácticas de seguridad en el pipeline**: el pipeline DEBE incluir, como
  mínimo, escaneo de dependencias vulnerables (ej. `npm audit` o equivalente)
  y verificación de que no se filtran secretos al código (ej. revisión
  automática de que no haya llaves o credenciales hardcodeadas antes de
  permitir el merge).
- **Despliegue automatizado desde `main`**: cada merge exitoso a `main`
  DEBE disparar el despliegue automático a producción (frontend en Vercel,
  backend/DB en Supabase), de forma que `main` sea siempre el reflejo exacto
  de lo que está en producción.

## Governance

Esta Constitución prevalece sobre cualquier otra práctica de desarrollo,
convención de equipo o preferencia técnica individual dentro del proyecto
ABASTO. Toda enmienda DEBE:

1. Documentarse explícitamente, indicando qué cambia y por qué.
2. Versionarse siguiendo semver: MAJOR para cambios incompatibles de
   principios, MINOR para nuevos principios o expansiones materiales, PATCH
   para aclaraciones o correcciones de redacción.
3. Revisar el impacto sobre plantillas dependientes antes de darse por
   completada.

Toda revisión de pull request o de especificación DEBE verificar cumplimiento
con los principios centrales. Cualquier complejidad que se aparte de un
principio DEBE justificarse explícitamente por escrito o rechazarse.

**Version**: 1.3.0 | **Ratified**: TODO(RATIFICATION_DATE): confirmar fecha de ratificación oficial | **Last Amended**: 2026-08-19
