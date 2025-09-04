# Integration Checklist: Meta Embedded Signup

- [ ] Configure environment variables: `META_APP_ID`, `META_APP_SECRET`, `META_GRAPH_VERSION`, `META_VERIFY_TOKEN`, `META_REDIRECT_URI`, `ENCRYPTION_KEY`.
- [ ] Run Prisma migrations to ensure `Instance` model contains coexistence fields.
- [ ] Start signup via `POST /v1/meta/start-signup` and complete OAuth flow.
- [ ] Verify callback persists tokens and instance metadata.
- [ ] Configure Meta webhook to `/v1/meta/webhook/{instanceId}` and verify with `GET` request.
- [ ] Ensure webhook POST requests include valid `X-Hub-Signature-256` header.
- [ ] Send message through Graph API using stored `phoneNumberId` and access token.
- [ ] Test token refresh with `POST /v1/meta/token/refresh/{instanceId}`.
- [ ] Confirm Baileys instances continue to operate normally.
