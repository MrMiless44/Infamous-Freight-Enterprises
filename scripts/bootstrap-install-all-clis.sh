#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Bootstrapping CLI installation (including Fly CLI)..."
bash "${SCRIPT_DIR}/install-all-clis.sh"

echo
echo "Verifying installed CLIs..."
bash "${SCRIPT_DIR}/verify-required-clis.sh"
