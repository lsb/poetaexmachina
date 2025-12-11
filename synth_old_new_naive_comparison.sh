#!/bin/bash
# Naive comparison script using GNU parallel
# Processes sample-texts/1*.txt with meter 'a'
# Processes sample-texts/2*.txt with meter 'lrlrlrlrlrla'
# Outputs JSONL to stdout

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Process each file and output a JSONL line
# Usage: process_one_file <filepath>
process_one_file() {
    local file="$1"
    local basename=$(basename "$file")

    # Determine meter based on filename
    local meter
    if [[ "$basename" == 1* ]]; then
        meter="a"
    elif [[ "$basename" == 2* ]]; then
        meter="lrlrlrlrlrla"
    else
        meter="a"
    fi

    # Read file content
    local text=$(cat "$file")

    # Get JSON-escaped versions using jq -Rs .
    local text_json=$(printf '%s' "$text" | jq -Rs .)
    local old_intermediate_json=$(printf '%s' "$text" | ./synth_old_intermediate.sh "$meter" 2>/dev/null | jq -Rs .)
    local new_intermediate_json=$(printf '%s' "$text" | ./synth_new_intermediate.sh "$meter" 2>/dev/null | jq -Rs .)
    # local old_pho_json=$(printf '%s' "$text" | ./synth_old.sh "$meter" 2>/dev/null | jq -Rs .)
    # local new_pho_json=$(printf '%s' "$text" | ./synth_new.sh "$meter" 2>/dev/null | jq -Rs .)
    local old_pho_json='""'
    local new_pho_json='""'

    # Output JSONL record
    printf '{"text":%s,"old_intermediate":%s,"new_intermediate":%s,"old_pho":%s,"new_pho":%s}\n' \
        "$text_json" "$old_intermediate_json" "$new_intermediate_json" "$old_pho_json" "$new_pho_json"
}

# If called with an argument, process that file directly
if [[ -n "$1" ]]; then
    process_one_file "$1"
    exit 0
fi

# Otherwise, find all matching files and process with parallel
find sample-texts \( -name '1*.txt' -o -name '2*.txt' \) -print0 | \
    parallel -0 -j16 "$0" {}
