# SSH Authorized Keys

This document tracks approved SSH public keys for production operations.

## Active keys

| Key ID | Added (UTC) | Algorithm | Fingerprint (SHA256) | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `ops-key-2026-04-30-01` | 2026-04-30 | RSA 4096 | `ENq3sUhcnOq79ETLvC9RN2Ltb/+52cXTGFaFWPicxsA` | Active | Imported from approved request |

## Apply key to host safely

Use `scripts/ops/sync-authorized-key.sh` to enforce fingerprint verification before adding a key to `~/.ssh/authorized_keys`.

### Option A: pass environment variables inline

```bash
KEY_ID=ops-key-2026-04-30-01 \
SSH_PUBLIC_KEY='ssh-rsa <full-public-key>' \
EXPECTED_SHA256='ENq3sUhcnOq79ETLvC9RN2Ltb/+52cXTGFaFWPicxsA' \
./scripts/ops/sync-authorized-key.sh
```

### Option B: use an environment file

```bash
cat > ./.ssh-key.env <<'ENV'
KEY_ID=ops-key-2026-04-30-01
SSH_PUBLIC_KEY="ssh-rsa <full-public-key>"
EXPECTED_SHA256=ENq3sUhcnOq79ETLvC9RN2Ltb/+52cXTGFaFWPicxsA
ENV

ENV_FILE=./.ssh-key.env ./scripts/ops/sync-authorized-key.sh
```

## Key custody and rotation policy

- **Do not commit private keys** or passphrases to the repository.
- Validate fingerprints out-of-band before granting access.
- For revocation, change status to `Revoked`, add `Revoked (UTC)` in notes, and remove the key from runtime access controls.
- Keep this registry in sync with runtime systems (`authorized_keys`, CI deploy keys, and platform access lists).
