#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-infamous-freight}"
KEEP_IMAGE="${KEEP_IMAGE:-}"
PRUNE_OLD_IMAGES="${PRUNE_OLD_IMAGES:-false}"
PRUNE_MAX_COUNT="${PRUNE_MAX_COUNT:-3}"
FORCE_PRUNE="${FORCE_PRUNE:-false}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed." >&2
    exit 1
  fi
}

require_cmd flyctl
require_cmd node

if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  echo "Error: FLY_API_TOKEN is not set." >&2
  exit 1
fi

echo "==> Checking Fly authentication"
flyctl auth whoami >/dev/null

echo "==> Reading machine image distribution for $APP_NAME"
machine_json="$(flyctl machine list -a "$APP_NAME" --json)"

summary="$(printf '%s' "$machine_json" | node -e '
let data="";
process.stdin.on("data", chunk => (data += chunk));
process.stdin.on("end", () => {
  const machines = JSON.parse(data);
  const byImage = new Map();
  let newest = { createdAt: 0, image: "" };

  for (const machine of machines) {
    const image = machine.config?.image || "<unknown-image>";
    const id = machine.id || "<unknown-id>";
    const current = byImage.get(image) || [];
    current.push(id);
    byImage.set(image, current);

    const createdAt = Date.parse(machine.created_at || machine.createdAt || "");
    if (Number.isFinite(createdAt) && createdAt > newest.createdAt) {
      newest = { createdAt, image };
    }
  }

  const ordered = Array.from(byImage.entries()).sort((a, b) => b[1].length - a[1].length);
  process.stdout.write(JSON.stringify({
    uniqueImageCount: ordered.length,
    newestImage: newest.image,
    groups: ordered.map(([image, ids]) => ({ image, ids }))
  }));
});
')"

unique_image_count="$(printf '%s' "$summary" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).uniqueImageCount));')"
newest_image="$(printf '%s' "$summary" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).newestImage));')"

printf '%s' "$summary" | node -e '
let data="";
process.stdin.on("data", c => (data += c));
process.stdin.on("end", () => {
  const parsed = JSON.parse(data);
  for (const group of parsed.groups) {
    console.log(`${group.ids.length} machine(s) with ${group.image}: ${group.ids.join(",")}`);
  }
});
'

if [[ "$unique_image_count" -le 1 ]]; then
  echo "OK: single deployed image already in use."
  exit 0
fi

echo "WARN: $APP_NAME currently has $unique_image_count deployed images across machines."

target_image="$KEEP_IMAGE"
if [[ -z "$target_image" ]]; then
  target_image="$newest_image"
fi

echo "Selected image to keep: $target_image"

if [[ -z "$target_image" || "$target_image" == "<unknown-image>" ]]; then
  echo "Error: unable to determine a valid image to keep. Set KEEP_IMAGE explicitly and retry." >&2
  exit 1
fi

if [[ "$PRUNE_OLD_IMAGES" != "true" ]]; then
  echo "No changes made. To prune old-image machines, rerun with:"
  echo "PRUNE_OLD_IMAGES=true APP_NAME=$APP_NAME KEEP_IMAGE=$target_image bash scripts/fly-reconcile-single-image.sh"
  exit 1
fi

prune_count="$(printf '%s' "$summary" | KEEP_IMAGE="$target_image" node -e '
let data="";
process.stdin.on("data", c => (data += c));
process.stdin.on("end", () => {
  const parsed = JSON.parse(data);
  const keep = process.env.KEEP_IMAGE;
  let count = 0;
  for (const group of parsed.groups) {
    if (group.image === keep) continue;
    count += group.ids.length;
  }
  console.log(count);
});
')"

if [[ "$FORCE_PRUNE" != "true" && "$prune_count" -gt "$PRUNE_MAX_COUNT" ]]; then
  echo "Error: refusing to prune $prune_count machines (PRUNE_MAX_COUNT=$PRUNE_MAX_COUNT)." >&2
  echo "Set FORCE_PRUNE=true after verifying machine/image mapping to continue." >&2
  exit 1
fi

echo "==> Pruning machines that are not using $target_image"
printf '%s' "$summary" | KEEP_IMAGE="$target_image" node -e '
let data="";
process.stdin.on("data", c => (data += c));
process.stdin.on("end", () => {
  const parsed = JSON.parse(data);
  const keep = process.env.KEEP_IMAGE;
  for (const group of parsed.groups) {
    if (group.image === keep) continue;
    for (const id of group.ids) console.log(id);
  }
});
' | while IFS= read -r machine_id; do
  [[ -z "$machine_id" ]] && continue
  echo "Destroying machine $machine_id"
  flyctl machine destroy "$machine_id" -a "$APP_NAME" --force
done

echo "==> Final image distribution"
flyctl machine list -a "$APP_NAME"
