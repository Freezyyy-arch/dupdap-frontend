# CSRF strategy

See the "CSRF protection" section of the README for the summary.

- Auth JWT lives in an httpOnly cookie with `SameSite=Lax` (or `Strict`) and `Secure`.
- Defence in depth: double-submit cookie. The backend sets a non-httpOnly
  `csrf_token` cookie; the frontend (`src/lib/csrf.ts`) copies it into the
  `X-CSRF-Token` header on POST, PUT, PATCH and DELETE requests. The backend
  rejects mutating requests whose header does not match the cookie.
- Safe methods (GET, HEAD, OPTIONS) never send the header and must not mutate state.
- If the cookie is absent (backend not yet issuing it) no header is sent.
