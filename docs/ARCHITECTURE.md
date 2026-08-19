# Documento de Decisiones Técnicas y Arquitectura: EMDECOB Solidaria

## 1. Visión General y Principios de Diseño
EMDECOB Solidaria ha sido concebida bajo una arquitectura de **Monolito Modular Frontend + Backend Serverless de Supabase**, optimizada para ejecutarse en entornos web modernos, como PWA instalable y compilarse nativamente para Android e iOS mediante Capacitor.

### Principales Decisiones:
- **React 19 + TypeScript Estricto + Vite 6+**: Alta velocidad de renderizado, empaquetado optimizado con división de código (code splitting).
- **TanStack Query (React Query v5)**: Única fuente de estado remoto. Previene duplicación de cachés y sincroniza automáticamente las vistas.
- **Supabase (PostgreSQL + Auth + Storage + Edge Functions)**:
  - **Numeric & Timestamptz**: Manejo estricto de precisiones numéricas (`numeric` para cantidades, `numeric(14,2)` para COP) y sellos temporales con zona horaria (`timestamptz`).
  - **Multi-tenancy por `organization_id`**: Aislamiento estricto de datos por organización en todas las tablas mediante Row Level Security (RLS).
  - **Vistas Security Invoker**: `public_verified_needs` y `public_campaign_stats` creadas con `security_invoker = true` para garantizar que el usuario anónimo sólo acceda a información estrictamente pública y anonimizada.
  - **Anonimización por HMAC en Edge Function**: La cédula y documento original del beneficiario se procesan a través de una Edge Function en el servidor que aplica HMAC SHA-256 salteado. Nunca se almacena ni expone el documento real en JWT, logs o vistas públicas.
  - **Auditoría Insert-Only**: Revocación explícita de `UPDATE` y `DELETE` en la tabla `audit_logs` para garantizar inmutabilidad.
  - **Motor Transaccional con Row Locking (`FOR UPDATE`)**: Las reservas, coincidencia de ayuda y entregas invocan funciones SQL que bloquean las filas para evitar condiciones de carrera o sobre-asignación de recursos.

## 2. Desacoplamiento de Pagos
El adaptador de pagos (`PaymentAdapter`) desacopla las intenciones de aporte monetario en Pesos Colombianos (COP) de las pasarelas reales. Por defecto en el MVP, las transacciones bancarias reales permanecen deshabilitadas sin simular pagos aprobados falsos.
