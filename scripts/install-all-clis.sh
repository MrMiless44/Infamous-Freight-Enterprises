#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing all required CLIs for Infamous Freight..."
bash "${SCRIPT_DIR}/install-required-clis.sh"
