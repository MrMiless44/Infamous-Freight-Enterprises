#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TOOLS_DIR="${REPO_ROOT}/.tools/bin"
mkdir -p "${TOOLS_DIR}"

install_flyctl() {
  if command -v flyctl >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/flyctl" ]]; then
    echo "flyctl already installed"
    return
  fi
  curl -fsSL https://fly.io/install.sh | FLYCTL_INSTALL="${REPO_ROOT}/.tools" sh
}

install_supabase() {
  if command -v supabase >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/supabase" ]]; then
    echo "supabase already installed"
    return
  fi

  local arch tmp url
  arch="amd64"
  [[ "$(uname -m)" =~ ^(aarch64|arm64)$ ]] && arch="arm64"

  url="https://github.com/supabase/cli/releases/latest/download/supabase_linux_${arch}.tar.gz"
  tmp="$(mktemp)"
  curl -fsSL "$url" -o "$tmp"
  tar -xzf "$tmp" -C "${TOOLS_DIR}" supabase
  rm -f "$tmp"
}

install_stripe() {
  if command -v stripe >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/stripe" ]]; then
    echo "stripe already installed"
    return
  fi

  local asset_pattern tmp asset_url
  asset_pattern="linux_x86_64.tar.gz"
  [[ "$(uname -m)" =~ ^(aarch64|arm64)$ ]] && asset_pattern="linux_arm64.tar.gz"

  asset_url="$(curl -fsSL https://api.github.com/repos/stripe/stripe-cli/releases/latest | grep -Eo 'https://[^" ]+' | grep "$asset_pattern" | head -n 1)"
  if [[ -z "$asset_url" ]]; then
    echo "Unable to resolve Stripe CLI download URL for ${asset_pattern}" >&2
    return 1
  fi

  tmp="$(mktemp)"
  curl -fsSL "$asset_url" -o "$tmp"
  tar -xzf "$tmp" -C "${TOOLS_DIR}" stripe
  rm -f "$tmp"
}

install_github_cli() {
  if command -v gh >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/gh" ]]; then
    echo "gh already installed"
    return
  fi

  local arch extract_dir tmp url version
  arch="amd64"
  [[ "$(uname -m)" =~ ^(aarch64|arm64)$ ]] && arch="arm64"
  version="$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest | grep -Eo '"tag_name":\s*"v[^"]+"' | head -n 1 | cut -d '"' -f 4)"
  url="https://github.com/cli/cli/releases/download/${version}/gh_${version#v}_linux_${arch}.tar.gz"
  tmp="$(mktemp)"
  extract_dir="$(mktemp -d)"
  curl -fsSL "$url" -o "$tmp"
  tar -xzf "$tmp" -C "$extract_dir"
  cp "${extract_dir}/gh_${version#v}_linux_${arch}/bin/gh" "${TOOLS_DIR}/gh"
  chmod +x "${TOOLS_DIR}/gh"
  rm -f "$tmp"
  rm -rf "$extract_dir"
}

install_netlify() {
  if command -v netlify >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/netlify" ]]; then
    echo "netlify already installed"
    return
  fi

  local netlify_prefix
  netlify_prefix="${REPO_ROOT}/.tools/netlify-cli"
  npm --prefix "${netlify_prefix}" install --no-save netlify-cli@latest >/dev/null
  if [[ -x "${netlify_prefix}/node_modules/.bin/netlify" ]]; then
    cp "${netlify_prefix}/node_modules/.bin/netlify" "${TOOLS_DIR}/netlify"
    chmod +x "${TOOLS_DIR}/netlify"
  fi
}

install_jq() {
  if command -v jq >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/jq" ]]; then
    echo "jq already installed"
    return
  fi

  local arch os url
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  if [[ "${os}" != "linux" ]]; then
    echo "Skipping jq local binary install on ${os}; install jq with your system package manager." >&2
    return
  fi

  arch="x86_64"
  [[ "$(uname -m)" =~ ^(aarch64|arm64)$ ]] && arch="aarch64"

  url="https://github.com/jqlang/jq/releases/latest/download/jq-linux-${arch}"
  curl -fsSL "$url" -o "${TOOLS_DIR}/jq"
  chmod +x "${TOOLS_DIR}/jq"
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "docker already installed"
    return
  fi

  if [[ "$(id -u)" -eq 0 ]]; then
    INSTALL_DOCKER=true bash "${SCRIPT_DIR}/install-docker-cli.sh"
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo INSTALL_DOCKER=true bash "${SCRIPT_DIR}/install-docker-cli.sh"
    return
  fi

  echo "Docker CLI requires root privileges to install. Re-run with sudo or as root:" >&2
  echo "  sudo INSTALL_DOCKER=true bash ${SCRIPT_DIR}/install-docker-cli.sh" >&2
  return 1
}

install_shellcheck() {
  if command -v shellcheck >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/shellcheck" ]]; then
    echo "shellcheck already installed"
    return
  fi

  if [[ "$(id -u)" -eq 0 ]]; then
    apt-get update
    apt-get install -y shellcheck
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y shellcheck
    return
  fi

  echo "shellcheck requires root privileges to install. Re-run with sudo or as root:" >&2
  echo "  sudo apt-get update && sudo apt-get install -y shellcheck" >&2
  return 1
}


install_flyctl
install_supabase
install_stripe
install_github_cli
install_netlify
install_jq
install_docker
install_shellcheck

echo "Required CLIs are available in ${TOOLS_DIR}."
echo "Add to PATH: export PATH=\"${TOOLS_DIR}:\$PATH\""

bash "${SCRIPT_DIR}/verify-required-clis.sh"
