#!/usr/bin/env node
/**
 * Test script for MBROLA WASM module
 *
 * Usage:
 *   node test-wasm.js
 */

const fs = require('fs');
const path = require('path');

// Load the Emscripten-generated module
const createMbrolaModule = require('../mbrola.js');

async function test() {
  console.log('Loading MBROLA WASM module...');
  const Module = await createMbrolaModule();

  // Wrap C functions
  const init_MBR = Module.cwrap('init_MBR', 'number', ['string']);
  const close_MBR = Module.cwrap('close_MBR', null, []);
  const reset_MBR = Module.cwrap('reset_MBR', 'number', []);
  const read_MBR = Module.cwrap('read_MBR', 'number', ['number', 'number']);
  const write_MBR = Module.cwrap('write_MBR', 'number', ['string']);
  const flush_MBR = Module.cwrap('flush_MBR', 'number', []);
  const getFreq_MBR = Module.cwrap('getFreq_MBR', 'number', []);
  const setNoError_MBR = Module.cwrap('setNoError_MBR', null, ['number']);
  const lastError_MBR = Module.cwrap('lastError_MBR', 'number', []);
  const lastErrorStr_MBR = Module.cwrap('lastErrorStr_MBR', 'number', ['number', 'number']);
  const getVersion_MBR = Module.cwrap('getVersion_MBR', 'number', ['number', 'number']);

  // Get version
  const versionBuf = Module._malloc(64);
  getVersion_MBR(versionBuf, 64);
  const version = Module.UTF8ToString(versionBuf);
  Module._free(versionBuf);
  console.log(`MBROLA version: ${version}`);

  // Load voice file
  const voicePath = path.join(__dirname, '..', 'i');
  if (!fs.existsSync(voicePath)) {
    console.error(`Voice file not found: ${voicePath}`);
    console.error('Make sure the Italian MBROLA voice file "i" is in the parent directory');
    process.exit(1);
  }

  console.log(`Loading voice file: ${voicePath}`);
  const voiceData = fs.readFileSync(voicePath);
  Module.FS.writeFile('/voice', voiceData);
  console.log(`Voice file loaded (${voiceData.length} bytes)`);

  // Initialize MBROLA
  console.log('Initializing MBROLA...');
  const initResult = init_MBR('/voice');
  if (initResult !== 0) {
    const errBuf = Module._malloc(256);
    lastErrorStr_MBR(errBuf, 256);
    const errMsg = Module.UTF8ToString(errBuf);
    Module._free(errBuf);
    console.error(`Init failed (${initResult}): ${errMsg}`);
    process.exit(1);
  }

  const sampleRate = getFreq_MBR();
  console.log(`Sample rate: ${sampleRate} Hz`);

  // Enable tolerance for missing diphones
  setNoError_MBR(1);

  // Test synthesis with a simple .pho string
  // Format: phoneme duration [pitch_points...]
  // This is "salve" (hello) in Latin/Italian phonemes
  const phoData = `
_ 50
S 80
A 120 50 110
L 80
W 60
E 120 50 100
_ 200
`;

  console.log('Writing phoneme data...');
  const written = write_MBR(phoData);
  console.log(`Wrote ${written} characters`);

  // Flush to signal end
  flush_MBR();

  // Read audio samples
  const chunkSize = 4096;
  const bufPtr = Module._malloc(chunkSize * 2); // 2 bytes per int16 sample
  const samples = [];

  console.log('Reading audio samples...');
  while (true) {
    const samplesRead = read_MBR(bufPtr, chunkSize);
    if (samplesRead <= 0) break;

    for (let i = 0; i < samplesRead; i++) {
      samples.push(Module.getValue(bufPtr + i * 2, 'i16'));
    }
  }
  Module._free(bufPtr);

  console.log(`Total samples: ${samples.length}`);
  console.log(`Duration: ${(samples.length / sampleRate).toFixed(2)} seconds`);

  // Write to WAV file
  if (samples.length > 0) {
    const wavPath = path.join(__dirname, 'test-output.wav');
    writeWav(wavPath, samples, sampleRate);
    console.log(`Wrote: ${wavPath}`);
  }

  // Clean up
  close_MBR();
  console.log('Test complete!');
}

function writeWav(filename, samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = samples.length * 2;
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(fileSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM data
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
