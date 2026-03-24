#!/bin/bash
set -euo pipefail

required_files=(
  "apps/api/dist/server.js"
  "apps/player/dist/index.html"
  "apps/admin/dist/index.html"
  "packages/shared/dist/index.js"
)

missing=()

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    missing+=("$file")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "Missing required build artifacts in deployment bundle:"
  for file in "${missing[@]}"; do
    echo "  - $file"
  done
  echo "Run 'pnpm build' before deploying to Elastic Beanstalk."
  exit 1
fi
