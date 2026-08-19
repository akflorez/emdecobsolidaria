# EMDECOB Solidaria - Plataforma de Gestión de Ayuda Social y Emergencias

Plataforma integral lista para producción orientada a la atención transparente y coordinada de emergencias en el departamento del Quindío y extensible a nivel nacional en Colombia.

---

## 🌟 Características Principales

1. **Recorrido Vertical de 13 Pasos Automatizado**:
   - Creación de campañas de emergencia por municipio (códigos oficiales DANE DIVIPOLA).
   - Formulario de solicitud por pasos con autoguardado de borrador, cámara móvil (Capacitor/Web) y asignación de código público aleatorio único de 8+ caracteres (`EMD-XXXXXXXX`).
   - Verificación por el coordinador, comprobación de duplicados mediante hash HMAC y publicación anónima.
   - Catálogo público anonimizado (con vista `security_invoker = true`) exponiendo exclusivamente datos autorizados sin PII.
   - Registro de ofrecimientos en especie o compromisos económicos en Pesos Colombianos (COP) mediante un adaptador desacoplado de pasarela.
   - Motor de coincidencias con aprobación del coordinador invocando funciones transaccionales SQL con bloqueo de filas (`FOR UPDATE`) y restricción `CHECK` de recurso.
   - Registro de entregas y confirmación directa por el beneficiario con evaluación de servicio.
   - Actualización en tiempo real de saldos e indicadores públicos/privados.
   - Registro de auditoría inmutable (`audit_logs` insert-only con `UPDATE` y `DELETE` revocados).

2. **Arquitectura y Multi-tenancy**:
   - React 19 + TypeScript estricto + Node 22+ + Vite 6+.
   - **TanStack Query (React Query v5)** como única fuente de estado remoto.
   - Supabase PostgreSQL con RLS en todas las tablas (`organization_id`).
   - PWA instalable con Service Worker para almacenamiento en caché de la interfaz exclusivamente.
   - Capacitor 7 preparado para compilación nativa en Android e iOS.

---

## 🛠️ Instalación y Ejecución Local

```bash
# 1. Clonar o abrir la carpeta del proyecto
cd "emdecob solidaria"

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Acceder a `http://localhost:5173`.

---

## 🧪 Pruebas Unitarias y E2E

```bash
# Ejecutar pruebas unitarias de dominio con Vitest
npm run test

# Ejecutar suite de pruebas E2E automatizadas con Playwright (Recorrido de 13 pasos)
npx playwright test
```

---

## 📁 Documentación Incluida en el Proyecto

- [ARCHITECTURE.md](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/docs/ARCHITECTURE.md): Documento de decisiones de arquitectura.
- [DATA_MODEL.md](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/docs/DATA_MODEL.md): Diagrama ER (Mermaid) y modelo de datos PostgreSQL.
- [ROLE_MATRIX.md](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/docs/ROLE_MATRIX.md): Matriz de roles y permisos.
- [MOBILE_BUILD_INSTRUCTIONS.md](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/docs/MOBILE_BUILD_INSTRUCTIONS.md): Guía para compilar APK Android y proyecto iOS Xcode.
- [PRODUCTION_CHECKLIST.md](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/docs/PRODUCTION_CHECKLIST.md): Lista de variables pendientes para producción.
- [001_initial_schema.sql](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/supabase/migrations/001_initial_schema.sql): Migración SQL con RLS, vistas `security_invoker`, transacciones y revocación de auditoría.
- [seed.sql](file:///c:/Users/ANA%20KARINA/Desktop/emdecob%20solidaria/supabase/seed.sql): Datos iniciales del Quindío (códigos DANE) y categorías.

---

## 📱 Compilación Móvil (Capacitor)

```bash
# Sincronizar proyecto con Android
npm run build
npx cap sync android
npx cap open android
```
