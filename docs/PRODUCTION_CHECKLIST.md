# Lista de Variables y Pasos Pendientes para Producción

## 1. Variables de Entorno en Servidor
- [ ] `VITE_SUPABASE_URL`: Establecer URL de la instancia Supabase de producción.
- [ ] `VITE_SUPABASE_ANON_KEY`: Asignar la llave anónima de la instancia en producción.
- [ ] `DOCUMENT_HMAC_SECRET`: Generar una cadena secreta aleatoria criptográficamente fuerte (mínimo 64 caracteres) en Supabase Edge Functions.
- [ ] `PAYMENT_GATEWAY_PROVIDER`: Configurar proveedor de pasarela de pagos autorizada en Colombia (ej: Wompi, ePayco, TuCompra) una vez se cuente con certificación legal y RUT de la organización.
- [ ] `PAYMENT_GATEWAY_SECRET_KEY`: Llave privada del proveedor de pagos.

## 2. Despliegue de Base de Datos y Edge Functions
- [ ] Ejecutar migración `supabase/migrations/001_initial_schema.sql` en el proyecto de Supabase Producción.
- [ ] Desplegar la Edge Function `document-hmac`: `supabase functions deploy document-hmac`.
- [ ] Configurar respaldos automáticos diarios (Database Backups) en el panel de Supabase.
- [ ] Configurar certificados SSL / HTTPS en el dominio oficial `emdecob.org`.
