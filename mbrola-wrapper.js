/**
 * MBROLA WebAssembly Wrapper
 *
 * Provides a high-level JavaScript API for the MBROLA speech synthesizer
 * compiled to WebAssembly.
 *
 * Usage:
 *   const mbrola = new MbrolaWasm();
 *   await mbrola.init('/path/to/voice/file');
 *   const audioData = await mbrola.synthesize(phoString);
 *   // audioData is Int16Array of PCM samples at voice sample rate
 *   mbrola.close();
 */

class MbrolaWasm {
  constructor() {
    this.module = null;
    this.initialized = false;
    this.voicePath = null;
    this.sampleRate = 16000; // Default, will be updated after init

    // Wrapped C functions (set after module loads)
    this._init_MBR = null;
    this._close_MBR = null;
    this._reset_MBR = null;
    this._read_MBR = null;
    this._write_MBR = null;
    this._flush_MBR = null;
    this._getFreq_MBR = null;
    this._setFreq_MBR = null;
    this._setNoError_MBR = null;
    this._setVolumeRatio_MBR = null;
    this._lastError_MBR = null;
    this._lastErrorStr_MBR = null;
    this._resetError_MBR = null;
  }

  /**
   * Load the WASM module
   * @param {string} wasmPath - Path to mbrola.js (mbrola.wasm must be alongside)
   */
  async loadModule(wasmPath = './mbrola.js') {
    if (this.module) return;

    // Dynamic import of the Emscripten-generated module
    // In browser, this assumes mbrola.js is loaded via script tag and
    // createMbrolaModule is available globally
    if (typeof createMbrolaModule === 'undefined') {
      throw new Error('MBROLA module not loaded. Include mbrola.js via script tag.');
    }

    this.module = await createMbrolaModule();

    // Wrap C functions for easier calling
    this._init_MBR = this.module.cwrap('init_MBR', 'number', ['string']);
    this._close_MBR = this.module.cwrap('close_MBR', null, []);
    this._reset_MBR = this.module.cwrap('reset_MBR', 'number', []);
    this._read_MBR = this.module.cwrap('read_MBR', 'number', ['number', 'number']);
    this._write_MBR = this.module.cwrap('write_MBR', 'number', ['string']);
    this._flush_MBR = this.module.cwrap('flush_MBR', 'number', []);
    this._getFreq_MBR = this.module.cwrap('getFreq_MBR', 'number', []);
    this._setFreq_MBR = this.module.cwrap('setFreq_MBR', null, ['number']);
    this._setNoError_MBR = this.module.cwrap('setNoError_MBR', null, ['number']);
    this._setVolumeRatio_MBR = this.module.cwrap('setVolumeRatio_MBR', null, ['number']);
    this._lastError_MBR = this.module.cwrap('lastError_MBR', 'number', []);
    this._lastErrorStr_MBR = this.module.cwrap('lastErrorStr_MBR', 'number', ['number', 'number']);
    this._resetError_MBR = this.module.cwrap('resetError_MBR', null, []);
  }

  /**
   * Initialize MBROLA with a voice database
   * @param {string} voiceUrl - URL to fetch the voice file from
   * @param {string} voiceName - Name to use in virtual filesystem (default: 'voice')
   */
  async init(voiceUrl, voiceName = 'voice') {
    if (!this.module) {
      await this.loadModule();
    }

    // Fetch the voice file
    console.log(`Fetching voice file from ${voiceUrl}...`);
    const response = await fetch(voiceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch voice file: ${response.status} ${response.statusText}`);
    }
    const voiceData = await response.arrayBuffer();

    // Write voice file to Emscripten virtual filesystem
    const voicePath = `/${voiceName}`;
    this.module.FS.writeFile(voicePath, new Uint8Array(voiceData));
    console.log(`Voice file written to virtual FS at ${voicePath} (${voiceData.byteLength} bytes)`);

    // Initialize MBROLA with the voice
    const result = this._init_MBR(voicePath);
    if (result !== 0) {
      const errorMsg = this._getLastError();
      throw new Error(`MBROLA init failed (code ${result}): ${errorMsg}`);
    }

    // Get the actual sample rate from the voice
    this.sampleRate = this._getFreq_MBR();
    console.log(`MBROLA initialized with sample rate: ${this.sampleRate} Hz`);

    // Set tolerant mode for missing diphones
    this._setNoError_MBR(1);

    this.voicePath = voicePath;
    this.initialized = true;
  }

  /**
   * Get the last error message from MBROLA
   */
  _getLastError() {
    const bufSize = 256;
    const bufPtr = this.module._malloc(bufSize);
    this._lastErrorStr_MBR(bufPtr, bufSize);
    const errorMsg = this.module.UTF8ToString(bufPtr);
    this.module._free(bufPtr);
    return errorMsg;
  }

  /**
   * Synthesize speech from .pho format string
   * @param {string} phoString - MBROLA .pho format phoneme string
   * @returns {Int16Array} - PCM audio samples (16-bit signed, at this.sampleRate)
   */
  synthesize(phoString) {
    if (!this.initialized) {
      throw new Error('MBROLA not initialized. Call init() first.');
    }

    // Reset any previous state/errors
    this._reset_MBR();
    this._resetError_MBR();

    // Ensure phoneme data ends with newline (MBROLA parser requirement)
    let phoData = phoString;
    if (!phoData.endsWith('\n')) {
      phoData += '\n';
    }
    // Add extra trailing newline to ensure proper parsing
    phoData += '\n';

    // Write the phoneme data
    const written = this._write_MBR(phoData);
    if (written === 0) {
      console.warn('Warning: write_MBR returned 0');
    }

    // Signal end of input
    this._flush_MBR();

    // Read all audio samples
    // We'll read in chunks and concatenate
    const chunkSize = 8192; // samples per chunk
    const chunks = [];
    let totalSamples = 0;

    // Allocate buffer for reading (2 bytes per sample for int16)
    const bufPtr = this.module._malloc(chunkSize * 2);

    while (true) {
      const samplesRead = this._read_MBR(bufPtr, chunkSize);

      if (samplesRead < 0) {
        // Error occurred
        const errorMsg = this._getLastError();
        this.module._free(bufPtr);
        throw new Error(`MBROLA synthesis error: ${errorMsg}`);
      }

      if (samplesRead === 0) {
        // No more samples
        break;
      }

      // Copy samples from WASM memory to JavaScript
      const samples = new Int16Array(samplesRead);
      for (let i = 0; i < samplesRead; i++) {
        samples[i] = this.module.getValue(bufPtr + i * 2, 'i16');
      }
      chunks.push(samples);
      totalSamples += samplesRead;
    }

    this.module._free(bufPtr);

    // Concatenate all chunks into a single array
    const result = new Int16Array(totalSamples);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Get the sample rate of the loaded voice
   */
  getSampleRate() {
    return this.sampleRate;
  }

  /**
   * Set the frequency ratio (pitch multiplier)
   * @param {number} ratio - Frequency ratio (1.0 = normal)
   */
  setFrequencyRatio(ratio) {
    if (!this.initialized) return;
    // MBROLA uses integer percentage, so 1.0 = 100
    this._setFreq_MBR(Math.round(ratio * this.sampleRate));
  }

  /**
   * Set the volume ratio
   * @param {number} ratio - Volume ratio (1.0 = normal)
   */
  setVolumeRatio(ratio) {
    if (!this.initialized) return;
    this._setVolumeRatio_MBR(ratio);
  }

  /**
   * Close and clean up MBROLA resources
   */
  close() {
    if (this.initialized && this.module) {
      this._close_MBR();
      this.initialized = false;
    }
  }
}

/**
 * Convert Int16Array PCM to Float32Array for Web Audio API
 * @param {Int16Array} int16Data - 16-bit signed PCM samples
 * @returns {Float32Array} - Normalized float samples (-1.0 to 1.0)
 */
function int16ToFloat32(int16Data) {
  const float32Data = new Float32Array(int16Data.length);
  for (let i = 0; i < int16Data.length; i++) {
    float32Data[i] = int16Data[i] / 32768.0;
  }
  return float32Data;
}

/**
 * Play PCM audio using Web Audio API
 * @param {Int16Array} pcmData - 16-bit signed PCM samples
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {Promise} - Resolves when playback completes
 */
async function playPcmAudio(pcmData, sampleRate) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create AudioBuffer
  const audioBuffer = audioContext.createBuffer(1, pcmData.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // Convert Int16 to Float32
  for (let i = 0; i < pcmData.length; i++) {
    channelData[i] = pcmData[i] / 32768.0;
  }

  // Create buffer source and play
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  return new Promise((resolve) => {
    source.onended = () => {
      audioContext.close();
      resolve();
    };
    source.start();
  });
}

/**
 * Create a WAV file blob from PCM data
 * @param {Int16Array} pcmData - 16-bit signed PCM samples
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {Blob} - WAV file blob
 */
function createWavBlob(pcmData, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length * 2;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const dataView = new Int16Array(buffer, 44);
  dataView.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MbrolaWasm, int16ToFloat32, playPcmAudio, createWavBlob };
}

// Also make available globally for browser use
if (typeof window !== 'undefined') {
  window.MbrolaWasm = MbrolaWasm;
  window.int16ToFloat32 = int16ToFloat32;
  window.playPcmAudio = playPcmAudio;
  window.createWavBlob = createWavBlob;
}
