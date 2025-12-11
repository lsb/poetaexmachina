#!/bin/bash
# Old AWK/Ruby synthesis pipeline - outputs intermediate (accentuated scanned) format
# Usage: echo "text" | ./synth_old_intermediate.sh [meter]
#
# Outputs the accentuated scanned intermediate format (after inc.awk)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

METER="${1:-}"

# Read input
INPUT=$(cat)

# If no meter specified, count vowels and use 'a' (anceps) for each
if [ -z "$METER" ]; then
    VOWEL_COUNT=$(echo "$INPUT" | tr -cd 'aeiouAEIOU' | wc -c | tr -d ' ')
    if [ "$VOWEL_COUNT" -eq 0 ]; then
        VOWEL_COUNT=1
    fi
    METER=$(printf 'a%.0s' $(seq 1 $VOWEL_COUNT))
fi

echo "$INPUT" \
   | gawk -f amp.awk 2>/dev/null \
   | gawk -f mrj.awk 2>/dev/null \
   | gawk -f unamp.awk 2>/dev/null \
   | gawk -f postamp.awk 2>/dev/null \
   | gawk -f nudiv.awk 2>/dev/null \
   | ruby scansion.rb "$METER" 2>/dev/null \
   | gawk -f inc.awk 2>/dev/null
