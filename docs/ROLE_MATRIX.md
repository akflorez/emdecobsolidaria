# Matriz de Roles y Permisos de Acceso: EMDECOB Solidaria

| Rol Operativo | Gestión de Usuarios / Org | Crear / Modificar Campañas | Verificación y Cambio de Prioridad de Casos | Aprobar Coincidencias (Matching) | Registrar Entregas | Acceso a Datos Sensibles de Beneficiarios | Ver Registros de Auditoría Inmutables |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Superadministrador** | ✅ Completo | ✅ Todas | ✅ Global | ✅ Global | ✅ Global | ✅ Con log auditoría | ✅ Completo |
| **Administrador de Org** | ✅ Su Org | ✅ Su Org | ✅ Su Org | ✅ Su Org | ✅ Su Org | ✅ Con log auditoría | ✅ Su Org |
| **Coordinador / Validador** | ❌ No | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Solo en verificación | ✅ Lectura |
| **Operador de Campo** | ❌ No | ❌ No | ❌ Solo registro | ❌ No | ✅ Sí | ❌ No PII | ❌ No |
| **Beneficiario** | ❌ No | ❌ No | ❌ Solo su caso | ❌ No | ❌ Confirmación recepción | ❌ Solo sus datos | ❌ No |
| **Donante** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **Profesional / Voluntario** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Su atención | ❌ No | ❌ No |
| **Auditor** | ❌ No | ❌ No | 👁️ Solo Lectura | 👁️ Solo Lectura | 👁️ Solo Lectura | ❌ No PII | 👁️ Solo Lectura |

## Autenticación Reforzada
Para roles administrativos e internos (`superadmin`, `org_admin`, `coordinator`), se exige autenticación reforzada y verificación de sesión activa con RLS en cada consulta SQL.
