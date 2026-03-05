/**
 * Poeta Ex Machina - Browser Module
 *
 * Integrates the Latin text-to-phoneme pipeline (synthesis.js) with
 * MBROLA WebAssembly for complete in-browser Latin speech synthesis.
 *
 * Usage:
 *   const poeta = new PoetaBrowser();
 *   await poeta.init({
 *     voiceUrl: '/i',           // MBROLA voice file
 *     scansionsUrl: '/scansions.json'  // Scansion dictionary
 *   });
 *
 *   // Synthesize and play
 *   await poeta.speak('Arma virumque cano', 'lrlrlrlrlrla');
 *
 *   // Or get audio data
 *   const { wav, sampleRate } = await poeta.synthesize('Arma virumque cano', 'lrlrlrlrlrla');
 */

class PoetaBrowser {
  constructor() {
    this.mbrola = null;
    this.scansionsLoaded = false;
    this.initialized = false;
  }

  /**
   * Initialize the Poeta system
   * @param {Object} options
   * @param {string} options.voiceUrl - URL to MBROLA voice file (e.g., Italian 'i')
   * @param {string} options.scansionsUrl - URL to scansions.json dictionary
   */
  async init(options = {}) {
    const {
      voiceUrl = '/i',
      scansionsUrl = '/scansions.json'
    } = options;

    // Load scansions dictionary if synthesis.js is available
    if (typeof loadScansions !== 'undefined' && !this.scansionsLoaded) {
      console.log('Loading scansions dictionary...');
      const response = await fetch(scansionsUrl);
      if (!response.ok) {
        throw new Error(`Failed to load scansions: ${response.status}`);
      }
      const dict = await response.json();
      loadScansions(dict);
      this.scansionsLoaded = true;
      console.log('Scansions dictionary loaded');
    }

    // Initialize MBROLA
    if (typeof MbrolaWasm !== 'undefined') {
      console.log('Initializing MBROLA WASM...');
      this.mbrola = new MbrolaWasm();
      await this.mbrola.init(voiceUrl);
      console.log('MBROLA WASM initialized');
    } else {
      throw new Error('MbrolaWasm not found. Include mbrola-wrapper.js');
    }

    this.initialized = true;
  }

  /**
   * Convert Latin text to .pho format
   * @param {string} text - Latin text
   * @param {string} meter - Meter specification (e.g., 'lrlrlrlrlrla')
   * @returns {string} - MBROLA .pho format
   */
  textToPho(text, meter) {
    if (typeof synthesize === 'undefined') {
      throw new Error('synthesis.js not loaded');
    }
    return synthesize(text, meter);
  }

  /**
   * Synthesize Latin text to audio
   * @param {string} text - Latin text
   * @param {string} meter - Meter specification
   * @returns {Object} - { pcm: Int16Array, sampleRate: number, wav: Blob }
   */
  async synthesize(text, meter) {
    if (!this.initialized) {
      throw new Error('Not initialized. Call init() first.');
    }

    // Generate .pho data from Latin text
    const pho = this.textToPho(text, meter);
    console.log('Generated .pho:\n' + pho.substring(0, 500) + (pho.length > 500 ? '...' : ''));

    // Synthesize audio via MBROLA WASM
    const pcm = this.mbrola.synthesize(pho);
    const sampleRate = this.mbrola.getSampleRate();

    // Create WAV blob
    const wav = createWavBlob(pcm, sampleRate);

    return { pcm, sampleRate, wav };
  }

  /**
   * Synthesize and play Latin text
   * @param {string} text - Latin text
   * @param {string} meter - Meter specification
   * @returns {Promise} - Resolves when playback completes
   */
  async speak(text, meter) {
    const { pcm, sampleRate } = await this.synthesize(text, meter);
    return playPcmAudio(pcm, sampleRate);
  }

  /**
   * Get the sample rate of the loaded voice
   */
  getSampleRate() {
    return this.mbrola ? this.mbrola.getSampleRate() : 0;
  }

  /**
   * Clean up resources
   */
  close() {
    if (this.mbrola) {
      this.mbrola.close();
      this.mbrola = null;
    }
    this.initialized = false;
  }
}

// Common meter patterns for convenience
const METERS = {
  // Dactylic hexameter: - u u | - u u | - u u | - u u | - u u | - x
  // Using 'r' for resolvable (long or two shorts), 'a' for anceps
  HEXAMETER: 'lrlrlrlrlrla',

  // Elegiac couplet (hexameter + pentameter)
  PENTAMETER: 'lrlrlalrlrla',

  // Hendecasyllable: x x - u u - u - u - x
  HENDECASYLLABLE: 'aalsslalass',

  // Sapphic: - u - x - u u - u - x
  SAPPHIC: 'laalaasslax',

  // Alcaic: x - u - x - u u - u x
  ALCAIC: 'alaalaasla',

  // Iambic trimeter: x - u - | x - u - | x - u -
  IAMBIC_TRIMETER: 'alalalala',

  // Iambic senarius (6 feet): u - | u - | u - | u - | u - | u -
  IAMBIC_SENARIUS: 'slslslslslsl'
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PoetaBrowser, METERS };
}

if (typeof window !== 'undefined') {
  window.PoetaBrowser = PoetaBrowser;
  window.METERS = METERS;
}
