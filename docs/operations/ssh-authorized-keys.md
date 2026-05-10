# SSH Authorized Keys

This document tracks approved SSH public keys for production operations.

## Active keys

| Key ID | Added (UTC) | Algorithm | Fingerprint (SHA256) | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `ops-key-2026-04-30-01` | 2026-04-30 | RSA 4096 | `ENq3sUhcnOq79ETLvC9RN2Ltb/+52cXTGFaFWPicxsA` | Active | Imported from approved request |
| `ops-key-2026-05-10-01` | 2026-05-10 | RSA 4096 | `+jmJ2MjDAwxuvW6zu8URZHNkOpAEF2YeI+QzH7PGWC4` | Active | Imported from approved request |

## Apply key to host safely

Use `scripts/ops/sync-authorized-key.sh` to enforce fingerprint verification before adding a key to `~/.ssh/authorized_keys`.

### Option A: pass environment variables inline

```bash
KEY_ID=ops-key-2026-05-10-01 \
SSH_PUBLIC_KEY='ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC8qFjaUnAirp8w7zj7zJtQLy7DwEwVkwKm7uwKMPoa79iMgELXLOOhIwV5lJo2CGPk/wz0T7Ou4sSj/FFJIj1lJViermPpNCWS1+XArgwefHiWguUMszSWdWwpoJ2VoIyFW57UlQi7UD5S9POgzepy8wVzqMLiuWvS9Cp6ShLBqVQfo/Qad9M1gBjKK3c2YfMQniGZDow4Os1ouv48+ZsjeokTIQWUf37XeKO0QFoQn2DCX4ts9tNy1QF80faTxYIiuVkvoAPBe4AucHDqtX8d/Ehs2wTz4gWKgt8zIisIqztq5hTqbTIRSFBiCMwnnduudoanL2XQzCbVesFizuMawZSjC2qjqtKk5fsLYvfg26SDXZ9mhtd15F8fIcXqMB6UebX9LvpsxnVFbXrRjNiQmjvBkkUtFM10l6uFMcuBFczORyl1CDh93kYahIlovuzqPWLfGgV65kOnixRGmhxnXodotPDk2yZrd3a6uP1W6t/RVfqHvMyqalXs137ArzRtAqNcr8Vror25UMg4GMPRtOoE1KUd3fas4ty0E/smvuP7MFM70VzgRcweo7Gra0qg+nj7pd0gH284wDV9y/+k9V6xFhWojQc398n2OfFWYBfIeSJuFrj1SBmq7I/DEIjhd/KaNJEUdBbfVpOS+Z3EnehSrXnosV0JTP+qsBWDmQ==' \
EXPECTED_SHA256='+jmJ2MjDAwxuvW6zu8URZHNkOpAEF2YeI+QzH7PGWC4' \
./scripts/ops/sync-authorized-key.sh
```

### Option B: use an environment file

```bash
cat > ./.ssh-key.env <<'ENV'
KEY_ID=ops-key-2026-05-10-01
SSH_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC8qFjaUnAirp8w7zj7zJtQLy7DwEwVkwKm7uwKMPoa79iMgELXLOOhIwV5lJo2CGPk/wz0T7Ou4sSj/FFJIj1lJViermPpNCWS1+XArgwefHiWguUMszSWdWwpoJ2VoIyFW57UlQi7UD5S9POgzepy8wVzqMLiuWvS9Cp6ShLBqVQfo/Qad9M1gBjKK3c2YfMQniGZDow4Os1ouv48+ZsjeokTIQWUf37XeKO0QFoQn2DCX4ts9tNy1QF80faTxYIiuVkvoAPBe4AucHDqtX8d/Ehs2wTz4gWKgt8zIisIqztq5hTqbTIRSFBiCMwnnduudoanL2XQzCbVesFizuMawZSjC2qjqtKk5fsLYvfg26SDXZ9mhtd15F8fIcXqMB6UebX9LvpsxnVFbXrRjNiQmjvBkkUtFM10l6uFMcuBFczORyl1CDh93kYahIlovuzqPWLfGgV65kOnixRGmhxnXodotPDk2yZrd3a6uP1W6t/RVfqHvMyqalXs137ArzRtAqNcr8Vror25UMg4GMPRtOoE1KUd3fas4ty0E/smvuP7MFM70VzgRcweo7Gra0qg+nj7pd0gH284wDV9y/+k9V6xFhWojQc398n2OfFWYBfIeSJuFrj1SBmq7I/DEIjhd/KaNJEUdBbfVpOS+Z3EnehSrXnosV0JTP+qsBWDmQ=="
EXPECTED_SHA256=+jmJ2MjDAwxuvW6zu8URZHNkOpAEF2YeI+QzH7PGWC4
ENV

ENV_FILE=./.ssh-key.env ./scripts/ops/sync-authorized-key.sh
```

### Verify fingerprint before applying

```bash
printf '%s\n' "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC8qFjaUnAirp8w7zj7zJtQLy7DwEwVkwKm7uwKMPoa79iMgELXLOOhIwV5lJo2CGPk/wz0T7Ou4sSj/FFJIj1lJViermPpNCWS1+XArgwefHiWguUMszSWdWwpoJ2VoIyFW57UlQi7UD5S9POgzepy8wVzqMLiuWvS9Cp6ShLBqVQfo/Qad9M1gBjKK3c2YfMQniGZDow4Os1ouv48+ZsjeokTIQWUf37XeKO0QFoQn2DCX4ts9tNy1QF80faTxYIiuVkvoAPBe4AucHDqtX8d/Ehs2wTz4gWKgt8zIisIqztq5hTqbTIRSFBiCMwnnduudoanL2XQzCbVesFizuMawZSjC2qjqtKk5fsLYvfg26SDXZ9mhtd15F8fIcXqMB6UebX9LvpsxnVFbXrRjNiQmjvBkkUtFM10l6uFMcuBFczORyl1CDh93kYahIlovuzqPWLfGgV65kOnixRGmhxnXodotPDk2yZrd3a6uP1W6t/RVfqHvMyqalXs137ArzRtAqNcr8Vror25UMg4GMPRtOoE1KUd3fas4ty0E/smvuP7MFM70VzgRcweo7Gra0qg+nj7pd0gH284wDV9y/+k9V6xFhWojQc398n2OfFWYBfIeSJuFrj1SBmq7I/DEIjhd/KaNJEUdBbfVpOS+Z3EnehSrXnosV0JTP+qsBWDmQ==" | ssh-keygen -lf -
# Expected: 4096 SHA256:+jmJ2MjDAwxuvW6zu8URZHNkOpAEF2YeI+QzH7PGWC4
```

## Key custody and rotation policy

- **Do not commit private keys** or passphrases to the repository.
- Validate fingerprints out-of-band before granting access.
- For revocation, change status to `Revoked`, add `Revoked (UTC)` in notes, and remove the key from runtime access controls.
- Keep this registry in sync with runtime systems (`authorized_keys`, CI deploy keys, and platform access lists).
