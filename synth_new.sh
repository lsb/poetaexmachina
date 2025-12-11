#!/bin/bash
# New JavaScript synthesis pipeline
# Usage: echo "text" | ./synth_new.sh [meter]
# Or: ./synth_new.sh [meter] < input.txt
#
# meter: metrical specification (default: auto-detect using 'a' for each vowel)
#        e.g., 'lrlrlrlrlrla' for dactylic hexameter
#
# Outputs to stdout: the MBROLA .pho format

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
METER="${1:-}"

node -e "
const fs = require('fs');
const synthesis = require('$SCRIPT_DIR/synthesis.js');
const scansions = JSON.parse(fs.readFileSync('$SCRIPT_DIR/scansions.json', 'utf8'));
synthesis.loadScansions(scansions);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  let chunk;
  while (chunk = process.stdin.read()) {
    input += chunk;
  }
});
process.stdin.on('end', () => {
  const text = input.trim();
  let meter = '$METER';
  if (!meter) {
    const vowelCount = (text.match(/[aeiouAEIOU]/g) || []).length;
    meter = 'a'.repeat(Math.max(vowelCount, 1));
  }
  const result = synthesis.synthesize(text, meter);
  process.stdout.write(result);
});
"
