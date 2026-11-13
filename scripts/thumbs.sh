#!/usr/bin/env bash
# Makes 420 px thumbnails of every freelance photo for the local contact sheet.
SRC="/home/jj/Documents/Freelance"; OUT="$(dirname "$0")/../.contact-sheet/thumbs"
cd "$SRC" || exit 1
find . -type f -iname '*.jpg' ! -path './2. Misc/*' ! -path './Street Photography/*' -print0 | sort -z > "$OUT/../list0"
tr '\0' '\n' < "$OUT/../list0" > "$OUT/../list.txt"
export OUT
xargs -0 -P 8 -I{} sh -c 'h=$(printf "%s" "$1" | md5sum | cut -c1-16); [ -f "$OUT/$h.jpg" ] || convert -define jpeg:size=840x840 "$1" -auto-orient -thumbnail 420x420 -quality 72 "$OUT/$h.jpg" 2>/dev/null' _ {} < "$OUT/../list0"
ls "$OUT" | wc -l
