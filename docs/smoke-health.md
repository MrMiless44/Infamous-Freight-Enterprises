# Health smoke test

The API ships with a lightweight smoke test that verifies the `/api/health` endpoint returns `ok: true`.

Run it locally or in CI with:

```bash
cd api && npm run smoke:health
```

By default the script hits `http://localhost/api/health`, but you can override the target with the `HEALTH_URL` environment variable for deployments that expose the API on a different host or port.

## Integrating into CI/deploy pipelines

After a deployment completes, run the same smoke test to verify the freshly deployed API responds with `ok: true` before promoting the release:

```bash
cd api && HEALTH_URL=https://api.mycompany.com/api/health npm run smoke:health
```

In GitHub Actions or similar pipelines, add a step that checks out the repo, installs dependencies for the API, and runs the smoke test. Fail the job if the script exits non-zero so unhealthy deployments are caught immediately.
