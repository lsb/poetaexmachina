#!/bin/bash
#
# Export scansions from SQLite database to JSON for browser use
#
# Usage:
#   ./export-scansions.sh [input.db] [output.json]
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_DB="${SCRIPT_DIR}/../merged-scansions.db"
DEFAULT_OUTPUT="${SCRIPT_DIR}/../scansions.json"

INPUT_DB="${1:-$DEFAULT_DB}"
OUTPUT_JSON="${2:-$DEFAULT_OUTPUT}"

if [ ! -f "$INPUT_DB" ]; then
    echo "Error: Database file not found: $INPUT_DB"
    echo "Available database files:"
    ls -la "${SCRIPT_DIR}/../"*.db 2>/dev/null || echo "  None found"
    exit 1
fi

echo "Exporting scansions from: $INPUT_DB"
echo "Output: $OUTPUT_JSON"

# Export to JSON format
# The database has columns: word, scansion (based on the mrj.awk code)
sqlite3 -json "$INPUT_DB" "SELECT word, scansion FROM merged_scansions" | \
  node -e "
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
    const dict = {};
    for (const row of data) {
      dict[row.word] = row.scansion;
    }
    console.log(JSON.stringify(dict, null, 0));
  " > "$OUTPUT_JSON"

# Check result
if [ -f "$OUTPUT_JSON" ]; then
    SIZE=$(wc -c < "$OUTPUT_JSON")
    ENTRIES=$(grep -o '":' "$OUTPUT_JSON" | wc -l)
    echo "Success! Exported ${ENTRIES} entries (${SIZE} bytes)"
else
    echo "Error: Failed to create output file"
    exit 1
fi
