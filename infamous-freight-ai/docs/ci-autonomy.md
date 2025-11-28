# CI Autonomy Playbook

This note describes how the Infæmous Freight ♊ stack keeps itself healthy during builds and deployments.

## Pipeline Flow

1. **Build** – `.github/workflows/docker-build.yml` builds API + Web Docker images with Buildx.
2. **Verify** – Extend the workflow with lint/tests (`npm run build`, `npm run lint`) before pushing images.
3. **Repair hook** – When a step fails, run `node scripts/ci-auto-repair.js` to send the current `.env` (or a scrubbed subset) to `POST /api/ai/repair/env`. The AI engine replies with a patched env + notes.
4. **Sign-off** – Call `POST /api/ai/sign/env` to capture a signature that can be attached to artifacts or releases.
5. **Deploy** – Once repaired, rerun the failed step or trigger a redeploy using your preferred platform (e.g., Fly.io, Render, ECS).

## Required secrets

| Variable                 | Purpose                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| `AI_AUTOREPAIR_ENDPOINT` | URL exposed by the API (usually `https://api.yourdomain.com/api/ai/repair/env`). |
| `AI_AUTOSIGN_ENDPOINT`   | URL for the signing endpoint.                                                    |
| `AI_SYNTHETIC_API_KEY`   | Shared key used by `authHybrid` middleware to authorize AI-driven calls.         |
| `AI_SECURITY_MODE`       | Optional flag (`strict`, `permissive`) propagated to the AI layer.               |

Store these values as GitHub Actions secrets or environment variables in your CI runner.

## Sample failure handler step

```yaml
- name: Invoke AI self-repair
  if: failure()
  env:
    AI_AUTOREPAIR_ENDPOINT: ${{ secrets.AI_AUTOREPAIR_ENDPOINT }}
    AI_SYNTHETIC_API_KEY: ${{ secrets.AI_SYNTHETIC_API_KEY }}
    AI_SECURITY_MODE: strict
  run: |
    node scripts/ci-auto-repair.js .env
```

## Operational tips

- **Scope control** – The repair/sign endpoints require the `system:admin` + `ai:repair` scopes, enforced automatically by `authHybrid`.
- **Redaction** – If you cannot send the raw `.env`, construct a temporary file with only the failing keys before calling the script.
- **Audit trail** – All maintenance calls flow through `audit` middleware so the AI actions appear in container logs and can be stored in `AiEvent` records later.
- **Testing** – Use the built-in simulator (`/internal/ai-sim`) while developing. Point `AI_AUTOREPAIR_ENDPOINT` to `http://localhost:4000/api/ai/repair/env` during local Docker runs.
