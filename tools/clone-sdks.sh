#!/usr/bin/env bash
# Clone (or update) every SDK repository next to the spec, so that
# `python3 tools/generate.py` can regenerate all of them at once.
set -euo pipefail
cd "$(dirname "$0")/.."
declare -A REPOS=(
  [node]=yativo-fiat-node
  [python]=yativo-fiat-python
  [php]=yativo-fiat-php
  [laravel]=yativo-fiat-laravel
  [go]=yativo-fiat-go
  [wordpress]=yativo-fiat-woocommerce
)
for dir in "${!REPOS[@]}"; do
  if [ -d "$dir/.git" ]; then
    git -C "$dir" pull --ff-only
  else
    git clone "https://github.com/Yativo/${REPOS[$dir]}.git" "$dir"
  fi
done
