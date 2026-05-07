#!/usr/bin/env bash
##############################################################################
# INFAMOUS FREIGHT - DEPLOYMENT AUTOMATION SCRIPT
#
# Automates deployment to multiple platforms:
#   Fly.io (Backend API) · Netlify (Frontend)
#   Docker (Local/Custom) · Kubernetes (Enterprise)
#
# Usage:
#   ./deploy.sh [platform] [environment]
#   ./deploy.sh fly        production
#   ./deploy.sh netlify    production
#   ./deploy.sh docker     staging
#   ./deploy.sh all        production
##############################################################################

set -euo pipefail

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Paths & globals (resolved before any cd)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$PROJECT_ROOT/logs/deploy_${TIMESTAMP}.log"
mkdir -p "$PROJECT_ROOT/logs"

# How long to wait for the service to start before health-checking (seconds)
DEPLOY_SETTLE_TIME="${DEPLOY_SETTLE_TIME:-10}"

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log()     { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}✅ $*${NC}" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}❌ $*${NC}" | tee -a "$LOG_FILE"; }
warning() { echo -e "${YELLOW}⚠️  $*${NC}" | tee -a "$LOG_FILE"; }

# ---------------------------------------------------------------------------
# ERR trap — fires on any non-zero exit, notifies Slack, and exits cleanly
# ---------------------------------------------------------------------------
on_error() {
  local exit_code=$1
  local line=$2
  error "Deployment failed at line $line (exit code $exit_code)"
  notify_slack "failure" \
    "Deployment of ${PLATFORM:-unknown} to ${ENVIRONMENT:-unknown} FAILED at line $line (exit $exit_code). See log: $LOG_FILE"
  exit "$exit_code"
}

trap 'on_error $? $LINENO' ERR

# ---------------------------------------------------------------------------
# Production safeguard — requires explicit typed confirmation
# ---------------------------------------------------------------------------
confirm_production() {
  local env="$1"
  if [[ "$env" == "production" ]]; then
    warning "You are about to deploy to PRODUCTION."
    if [[ -t 0 ]]; then
      # Interactive terminal: prompt the user
      read -rp "Type 'yes' to confirm: " confirm
      if [[ "$confirm" != "yes" ]]; then
        error "Deployment cancelled by user."
        exit 1
      fi
    else
      # Non-interactive (CI): require an env var instead
      if [[ "${CONFIRM_PRODUCTION:-}" != "yes" ]]; then
        error "Non-interactive production deploy requires CONFIRM_PRODUCTION=yes"
        exit 1
      fi
    fi
  fi
}

# ===========================================================================
# PRE-DEPLOYMENT CHECKS
# ===========================================================================

pre_deployment_checks() {
  log "Running pre-deployment checks..."

  if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    error "package.json not found"
    exit 1
  fi

  local env_name env_file
  env_name="${ENVIRONMENT:-production}"
  env_file="$PROJECT_ROOT/.env.${env_name}"
  if [[ ! -f "$env_file" ]]; then
    error "$(basename "$env_file") not found. Create it from .env.example"
    exit 1
  fi

  local node_major
  node_major="$(node -v | cut -d'v' -f2 | cut -d'.' -f1)"
  if (( node_major < 20 )); then
    error "Node.js 20+ required. Current: $(node -v)"
    exit 1
  fi

  local npm_major
  npm_major="$(npm -v | cut -d'.' -f1)"
  if (( npm_major < 10 )); then
    error "npm 10+ required. Current: $(npm -v)"
    exit 1
  fi

  success "Pre-deployment checks passed"
}

# ===========================================================================
# BUILD FUNCTIONS
# ===========================================================================

build_backend() {
  log "Building backend..."
  cd "$PROJECT_ROOT"
  npm run build:api
  success "Backend build completed"
}

build_frontend() {
  log "Building frontend..."
  cd "$PROJECT_ROOT"
  npm run build:web
  success "Frontend build completed"
}

build_docker() {
  log "Building Docker image..."
  cd "$PROJECT_ROOT"
  docker build -t infamous-freight-api:latest .
  success "Docker build completed"
}

# ===========================================================================
# TEST FUNCTIONS
# ===========================================================================

run_tests() {
  log "Running tests..."
  cd "$PROJECT_ROOT"
  npm run lint

  local tsconfig_paths=()
  shopt -s nullglob
  tsconfig_paths=("$PROJECT_ROOT"/apps/*/tsconfig.json)
  shopt -u nullglob

  if (( ${#tsconfig_paths[@]} > 0 )); then
    for tsconfig_path in "${tsconfig_paths[@]}"; do
      npx tsc -p "$tsconfig_path" --noEmit
    done
  else
    log "No app tsconfig.json files found under apps/, skipping typecheck"
  fi
  npm test -- --coverage
  success "All tests passed"
}

# ===========================================================================
# DEPLOYMENT FUNCTIONS
# ===========================================================================

validate_container_image_ref() {
  local image_ref="$1"

  # Conservative validation for container image references used in deployment.
  if [[ "$image_ref" =~ [[:space:]] ]]; then
    error "Invalid FLY_DEPLOY_IMAGE: must not contain whitespace"
    exit 1
  fi

  if [[ "$image_ref" != registry.fly.io/* ]]; then
    error "Invalid FLY_DEPLOY_IMAGE: expected image in registry.fly.io/<app>:<tag> format"
    exit 1
  fi

  if [[ "$image_ref" != *":"* && "$image_ref" != *@sha256:* ]]; then
    error "Invalid FLY_DEPLOY_IMAGE: expected a tagged image or digest (example: registry.fly.io/app:tag)"
    exit 1
  fi
}

deploy_fly() {
  local env="$1"
  log "Deploying to Fly.io ($env)..."

  if ! command -v flyctl &> /dev/null; then
    error "Fly CLI not installed. See https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
  fi

  local app_name
  if [[ "$env" == "production" ]]; then
    app_name="infamous-freight"
  else
    app_name="infamous-freight-api-${env}"
  fi
  export FLY_APP_NAME="$app_name"

  cd "$PROJECT_ROOT"

  local deploy_image="${FLY_DEPLOY_IMAGE:-}"
  local -a fly_args=(deploy --app "$app_name" --remote-only)
  if [[ -n "$deploy_image" ]]; then
    validate_container_image_ref "$deploy_image"
    log "Deploying prebuilt Fly image: $deploy_image"
    fly_args+=(--image "$deploy_image")
  fi

  # Redact any lines that look like secrets from the tee'd log
  flyctl "${fly_args[@]}" 2>&1 \
    | grep -v -iE '(secret|key|token|password)' \
    | tee -a "$LOG_FILE" \
    || true   # let the trap handle real failures; grep exit-codes aren't failures

  success "Deployed to Fly.io: $app_name"
}

deploy_netlify() {
  local env="$1"
  log "Deploying to Netlify ($env)..."

  if ! command -v netlify &> /dev/null; then
    error "Netlify CLI not installed. Run: npm install -g netlify-cli"
    exit 1
  fi

  cd "$PROJECT_ROOT"

  if [[ "$env" == "production" ]]; then
    netlify deploy --prod --dir=apps/web/dist
  else
    netlify deploy --dir=apps/web/dist
  fi

  success "Deployed to Netlify"
}

deploy_docker() {
  local env="$1"
  log "Deploying Docker ($env)..."

  build_docker

  local registry="${DOCKER_REGISTRY:-registry.example.com}"
  local tag="${registry}/infamous-freight-api:${env}-${TIMESTAMP}"
  docker tag infamous-freight-api:latest "$tag"

  log "Pushing to registry: $tag"
  docker push "$tag"

  success "Docker deployment completed: $tag"
}

deploy_kubernetes() {
  local env="$1"
  log "Deploying to Kubernetes ($env)..."

  if ! command -v kubectl &> /dev/null; then
    error "kubectl not installed"
    exit 1
  fi

  build_docker

  local registry="${DOCKER_REGISTRY:-registry.example.com}"
  local image="${registry}/infamous-freight-api:${env}"
  docker tag infamous-freight-api:latest "$image"
  docker push "$image"

  kubectl set image deployment/infamous-freight-api \
    "api=${image}" \
    -n infamous-freight

  kubectl rollout status deployment/infamous-freight-api -n infamous-freight

  success "Kubernetes deployment completed"
}

# ===========================================================================
# VERIFICATION
# ===========================================================================

verify_deployment() {
  local env="$1"
  log "Verifying deployment ($env)..."

  # Pick the correct health-check URL for this environment
  local health_url
  case "$env" in
    production) health_url="${HEALTH_CHECK_URL:-https://api.infamousfreight.com/health}" ;;
    staging)    health_url="${HEALTH_CHECK_URL:-https://api-staging.infamousfreight.com/health}" ;;
    *)          health_url="${HEALTH_CHECK_URL:-http://localhost:3000/health}" ;;
  esac

  log "Waiting ${DEPLOY_SETTLE_TIME}s for service to settle..."
  sleep "$DEPLOY_SETTLE_TIME"

  log "Checking health: $health_url"

  # Exponential back-off: 5 → 10 → 20 → … seconds
  local delay=5
  for i in $(seq 1 10); do
    if curl -sf "$health_url" > /dev/null; then
      success "Health check passed: $health_url"
      return 0
    fi
    warning "Attempt $i/10 failed — retrying in ${delay}s..."
    sleep "$delay"
    delay=$(( delay * 2 ))
  done

  error "Health check failed after 10 attempts: $health_url"
  exit 1
}

# ===========================================================================
# ROLLBACK
# ===========================================================================

rollback_fly() {
  log "Rolling back Fly.io deployment..."

  if ! command -v flyctl &> /dev/null; then
    error "Fly CLI not installed"
    exit 1
  fi

  local version="${ROLLBACK_VERSION:-}"

  if [[ -z "$version" ]]; then
    if [[ -t 0 ]]; then
      # Interactive: show available releases then prompt
      flyctl releases
      read -rp "Enter release version to rollback to: " version
    else
      error "ROLLBACK_VERSION must be set in non-interactive mode"
      exit 1
    fi
  fi

  flyctl releases rollback "$version"
  success "Fly.io rollback to $version completed"
}

rollback_kubernetes() {
  log "Rolling back Kubernetes deployment..."

  if ! command -v kubectl &> /dev/null; then
    error "kubectl not installed"
    exit 1
  fi

  kubectl rollout undo deployment/infamous-freight-api -n infamous-freight
  kubectl rollout status deployment/infamous-freight-api -n infamous-freight

  success "Kubernetes rollback completed"
}

# ===========================================================================
# SLACK NOTIFICATION
# Builds JSON with jq to avoid shell-injection via branch names / messages
# ===========================================================================

notify_slack() {
  local status="$1"
  local message="$2"

  [[ -z "${SLACK_WEBHOOK_URL:-}" ]] && return 0

  if ! command -v jq &> /dev/null; then
    warning "jq not found — skipping Slack notification"
    return 0
  fi

  local color
  color="$([ "$status" = "failure" ] && echo danger || echo good)"

  local payload
  payload="$(jq -n \
    --arg color   "$color" \
    --arg title   "Deployment $status" \
    --arg text    "$message" \
    --argjson ts  "$(date +%s)" \
    '{"attachments":[{"color":$color,"title":$title,"text":$text,"ts":$ts}]}')"

  curl -sf -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "$payload" || warning "Slack notification failed (non-fatal)"
}

# ===========================================================================
# MAIN
# ===========================================================================

# Export so on_error can reference them
PLATFORM="${1:-all}"
ENVIRONMENT="${2:-production}"
export PLATFORM ENVIRONMENT

main() {
  log "=========================================="
  log "INFAMOUS FREIGHT DEPLOYMENT"
  log "=========================================="
  log "Platform:    $PLATFORM"
  log "Environment: $ENVIRONMENT"
  log "Timestamp:   $TIMESTAMP"
  log "Log file:    $LOG_FILE"
  log "=========================================="

  confirm_production "$ENVIRONMENT"
  pre_deployment_checks
  run_tests

  case "$PLATFORM" in
    fly)
      build_backend
      deploy_fly "$ENVIRONMENT"
      verify_deployment "$ENVIRONMENT"
      ;;
    netlify)
      build_frontend
      deploy_netlify "$ENVIRONMENT"
      ;;
    docker)
      build_backend
      deploy_docker "$ENVIRONMENT"
      ;;
    kubernetes)
      build_backend
      deploy_kubernetes "$ENVIRONMENT"
      verify_deployment "$ENVIRONMENT"
      ;;
    all)
      build_backend
      build_frontend
      build_docker
      deploy_fly "$ENVIRONMENT"
      deploy_netlify "$ENVIRONMENT"
      verify_deployment "$ENVIRONMENT"
      # Kubernetes is intentionally excluded from 'all' — deploy separately:
      #   ./deploy.sh kubernetes $ENVIRONMENT
      warning "Kubernetes is not included in 'all'. Deploy separately if needed:"
      warning "  ./deploy.sh kubernetes $ENVIRONMENT"
      ;;
    rollback-fly)
      rollback_fly
      ;;
    rollback-kubernetes)
      rollback_kubernetes
      ;;
    *)
      error "Unknown platform: $PLATFORM"
      echo "Usage: $0 [fly|netlify|docker|kubernetes|all|rollback-fly|rollback-kubernetes] [production|staging|development]"
      exit 1
      ;;
  esac

  notify_slack "success" \
    "Deployment of $PLATFORM to $ENVIRONMENT completed successfully. Log: $LOG_FILE"

  success "=========================================="
  success "DEPLOYMENT COMPLETED SUCCESSFULLY"
  success "Log file: $LOG_FILE"
  success "=========================================="
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
