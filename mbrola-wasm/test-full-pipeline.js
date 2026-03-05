#!/usr/bin/env node
/**
 * Full pipeline test: Latin text -> synthesis.js -> MBROLA WASM -> WAV
 *
 * Usage:
 *   node test-full-pipeline.js "Arma virumque cano" lrlrlrlrlrla
 */

const fs = require('fs');
const path = require('path');

// Load synthesis.js
const synthesis = require('../synthesis.js');

// Load scansions dictionary
const scansionsPath = path.join(__dirname, '..', 'scansions.json');
if (fs.existsSync(scansionsPath)) {
  const scansions = JSON.parse(fs.readFileSync(scansionsPath, 'utf8'));
  synthesis.loadScansions(scansions);
  console.log('Loaded scansions dictionary');
} else {
  console.warn('Warning: scansions.json not found, using fallback syllabification');
  synthesis.loadScansions({});
}

// Load MBROLA WASM
const createMbrolaModule = require('./mbrola.js');

async function synthesizeLatinToWav(text, meter, outputFile) {
  console.log(`\nInput text: "${text}"`);
  console.log(`Meter: ${meter}`);

  // Stage 1: Convert Latin text to .pho format using synthesis.js
  console.log('\n--- Stage 1: Text to PHO ---');
  const pho = synthesis.synthesize(text, meter);
  console.log('Generated .pho:');
  console.log(pho.split('\n').slice(0, 20).join('\n') + (pho.split('\n').length > 20 ? '\n...' : ''));

  // Stage 2: Synthesize .pho to audio using MBROLA WASM
  console.log('\n--- Stage 2: PHO to Audio ---');
  const Module = await createMbrolaModule();

  // Wrap functions
  const init_MBR = Module.cwrap('init_MBR', 'number', ['string']);
  const close_MBR = Module.cwrap('close_MBR', null, []);
  const read_MBR = Module.cwrap('read_MBR', 'number', ['number', 'number']);
  const write_MBR = Module.cwrap('write_MBR', 'number', ['string']);
  const flush_MBR = Module.cwrap('flush_MBR', 'number', []);
  const getFreq_MBR = Module.cwrap('getFreq_MBR', 'number', []);
  const setNoError_MBR = Module.cwrap('setNoError_MBR', null, ['number']);

  // Load voice
  const voicePath = path.join(__dirname, '..', 'i');
  const voiceData = fs.readFileSync(voicePath);
  Module.FS.writeFile('/voice', voiceData);

  // Initialize
  const result = init_MBR('/voice');
  if (result !== 0) {
    throw new Error(`MBROLA init failed: ${result}`);
  }

  const sampleRate = getFreq_MBR();
  console.log(`Sample rate: ${sampleRate} Hz`);

  setNoError_MBR(1);

  // Write phonemes
  write_MBR(pho);
  flush_MBR();

  // Read audio
  const chunkSize = 8192;
  const bufPtr = Module._malloc(chunkSize * 2);
  const samples = [];

  while (true) {
    const count = read_MBR(bufPtr, chunkSize);
    if (count <= 0) break;
    for (let i = 0; i < count; i++) {
      samples.push(Module.getValue(bufPtr + i * 2, 'i16'));
    }
  }
  Module._free(bufPtr);
  close_MBR();

  console.log(`Generated ${samples.length} samples (${(samples.length / sampleRate).toFixed(2)}s)`);

  // Write WAV
  writeWav(outputFile, samples, sampleRate);
  console.log(`\nWrote: ${outputFile}`);

  return { samples, sampleRate, pho };
}

function writeWav(filename, samples, sampleRate) {
  const dataSize = samples.length * 2;
  const fileSize = 44 + dataSize;
  const buffer = Buffer.alloc(fileSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
}

// Main
const args = process.argv.slice(2);
const text = args[0] || 'Arma virumque cano';
const meter = args[1] || 'lrlrlrlrlrla';
const output = args[2] || path.join(__dirname, 'latin-speech.wav');

synthesizeLatinToWav(text, meter, output)
  .then(() => console.log('\nSuccess!'))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
