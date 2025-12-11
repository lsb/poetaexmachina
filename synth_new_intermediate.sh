#!/bin/bash
# New JavaScript synthesis pipeline - outputs intermediate (accentuated scanned) format
# Usage: echo "text" | ./synth_new_intermediate.sh [meter]
#
# Outputs the accentuated scanned intermediate format (after inc stage)

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
  // Run pre-scansion, scansion, and inc stages
  let result = synthesis.preScansion(text);
  result = synthesis.scansion(result, meter);
  result = synthesis.inc(result);
  process.stdout.write(result);
});
"
