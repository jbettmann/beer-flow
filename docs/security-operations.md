# Security Operations

- Rotate GitHub OAuth secrets and Google OAuth secrets that were previously exposed through frontend config.
- Verify `next.config.js` does not passthrough client env values for OAuth provider secrets or IDs.
- Keep `ENABLE_MESSAGE_API` unset or `false` unless the `/api/message` route is explicitly needed.
- Treat `session.user.accessToken` as a temporary bridge only; keep `refreshToken` server-only and out of browser session payloads.
- Confirm invite token URL hygiene: remove `?token=` from the browser address bar immediately after capture and never log the token.
- Phase 5 follow-up is deferred: broad server-side mutation authorization migration, including brewery/tenant ownership checks and client token removal, is out of scope for this phase.
