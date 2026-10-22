#!/usr/bin/env bash
# Copy the spec and generator into each SDK checkout and regenerate it.
# Run tools/clone-sdks.sh first. Review and commit the changes in each SDK repository.
set -euo pipefail
cd "$(dirname "$0")/.."
for lang in node python php go; do
  [ -d "$lang" ] || { echo "skip $lang (not checked out)"; continue; }
  mkdir -p "$lang/spec" "$lang/tools"
  cp spec/endpoints.json "$lang/spec/endpoints.json"
  cp tools/generate.py "$lang/tools/generate.py"
done
python3 tools/generate.py
