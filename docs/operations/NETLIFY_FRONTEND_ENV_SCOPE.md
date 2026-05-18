# Netlify Frontend Environment Scope Checklist

## Purpose

Keep the Netlify frontend deploy surface limited to browser-safe configuration.

This checklist covers dashboard settings that cannot be changed safely from repository code. Do not paste private values into issues, pull requests, commits, or chat.

## Best free/legal gateway

Use the Netlify project dashboard and each provider dashboard directly.

## Exact next steps

1. Open the Netlify project for the public site.
2. Review environment variables by deploy scope.
3. Keep browser-safe frontend values in frontend build scope.
4. Move private server-only values out of frontend build scope unless a deployed server-side Netlify function truly needs them.
5. Rotate any private value that may have been exposed to a frontend deploy surface.
6. Redeploy production.
7. Run the verification commands below.

## Frontend-safe configuration pattern

The public web app should use same-origin API routing where possible:

```text
VITE_API_URL=/api
```

Public browser configuration can stay in frontend scope. Private backend/provider configuration should live only in backend or function scopes that need it.

## Verification

Run:

```bash
pnpm run env:check:frontend
pnpm run netlify:production:readiness
```

Then confirm:

- The public site renders in a browser.
- Public quote and tracking flows still work.
- Browser-visible files and responses do not expose private operational configuration.

## Repeatable loop

Run this after each new provider integration:

1. Review frontend env scope.
2. Move private backend-only values out of frontend scope.
3. Rotate exposed values where needed.
4. Redeploy.
5. Run readiness checks.
6. Record evidence in the launch evidence log.

## Risk check

Do not remove values blindly from server-side function scopes. First confirm whether a deployed function uses the value. Frontend scope should stay browser-safe.

## Related

Supports #2244.
