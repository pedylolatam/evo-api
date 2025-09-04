# Guía de Integración: Evolution API + Meta Coexistencia (Embedded Signup)

## 1. Contexto
Este documento describe cómo integrar la coexistencia de WhatsApp Business API (WABA) mediante el flujo **Embedded Signup de Meta** dentro de Evolution API, manteniendo soporte para múltiples conectores (Baileys y WABA).

## 2. Requisitos Previos
- Cuenta de Meta aprobada como **Proveedor de Servicios (BSP)** bajo la app **Pedylo Latam**.
- Evolution API desplegado (Node.js 20, TypeScript, Express, Prisma, MariaDB).
- Variables de entorno Meta configuradas:
  - `META_GRAPH_VERSION`
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_VERIFY_TOKEN`
  - `META_REDIRECT_URI`
  - `ENCRYPTION_KEY`

## 3. Flujo de Integración (Embedded Signup)
1. Cliente inicia el proceso desde Evolution API → se abre ventana de Meta Embedded Signup.
2. Meta devuelve:
   - `access_token` (de corta duración → se intercambia por refresh token).
   - `business_id`
   - `waba_id`
   - `phone_number_id`
3. Evolution API guarda esta información en la BD (`Instance` extendido).
4. Webhooks configurados en Meta apuntan a `/v1/meta/webhook/{instanceId}`.

## 4. Cambios en Evolution API
### a. Modelos de Base de Datos
Extender `Instance` para incluir:
- `providerType`
- `accessToken`
- `refreshToken`
- `businessId`
- `wabaId`
- `phoneNumberId`
- `phoneNumber`
- `status`

### b. Endpoints Nuevos
- `POST /v1/meta/start-signup` → inicia el flujo embebido de Meta.
- `GET /v1/meta/callback` → procesa el `code` devuelto por Meta.
- `GET /v1/meta/webhook/:instanceId` → verificación del webhook.
- `POST /v1/meta/webhook/:instanceId` → recepción de mensajes y eventos.

### c. Webhooks
- `GET /v1/meta/webhook/:instanceId` → verificación con `META_VERIFY_TOKEN`.
- `POST /v1/meta/webhook/:instanceId` → recepción de mensajes y eventos (firmados con `META_APP_SECRET`).

### d. Conectores
- **Baileys** (conexión vía QR).
- **WABA Coexistencia** (conexión vía Meta Cloud API).
- Cada instancia puede definir `providerType`.

## 5. Seguridad
- Validar cabecera `X-Hub-Signature-256` para webhooks.
- Guardar tokens cifrados en BD con AES‑256‑GCM.
- Usar API Keys (`x-api-key`) para endpoints de envío.

## 6. Checklist de Implementación
- [ ] Definir modelos Prisma actualizados.
- [ ] Crear migración BD.
- [ ] Agregar endpoints de coexistencia.
- [ ] Implementar flujo OAuth Embedded Signup.
- [ ] Configurar webhooks en Meta Developer.
- [ ] Probar coexistencia con cuentas demo y reales.

## 7. Documentación de Referencia
- [Meta for Developers – WhatsApp Embedded Signup](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started/embedded-signup/)
- [Meta Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Evolution API](https://github.com/EvolutionAPI/evolution-api)

## 8. Próximos Pasos
1. Añadir cambios en el código base de Evolution API.
2. Publicar documentación en `docs/INTEGRATION_GUIDE.md`.
