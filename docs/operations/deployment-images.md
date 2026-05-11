# Deployment Image Ledger

## 2026-05-11

- Fly.io API image candidate: `registry.fly.io/infamous-freight-api:deployment-1a9c156c220a265889680cecb205bbd8`
- Validation: image follows `registry.fly.io/<app>:<tag>` format expected by Fly image deployments and matches the app name in `fly.toml`.
- Note: `deploy.sh production` currently targets the `infamous-freight` Fly app, so this image should be used only for the `infamous-freight-api` app path unless the production app target is intentionally changed.

## 2026-05-10

- Fly.io production image candidate: `registry.fly.io/infamous-freight:deployment-01KR8JZYJNANQ5DBHJPR0A7EGF`
- Validation: image follows `registry.fly.io/<app>:<tag>` format expected by `deploy.sh`.
