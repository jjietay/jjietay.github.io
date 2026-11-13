#!/usr/bin/env bash
# Makes a 640 px copy of each photo in public/photos, for the gallery grids.
set -e
cd "$(dirname "$0")/../public/photos"
find client street -name '*.webp' | while read -r f; do
  mkdir -p "thumb/$(dirname "$f")"
  [ -f "thumb/$f" ] || echo "$f"
done | xargs -P 8 -I{} convert {} -resize '640x640>' -quality 78 thumb/{}
