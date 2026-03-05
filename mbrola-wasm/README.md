# MBROLA WebAssembly Build

This directory contains the tooling to compile MBROLA speech synthesizer to WebAssembly for browser use.

## Prerequisites

1. **Emscripten SDK** - LLVM-to-WebAssembly compiler
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source emsdk_env.sh
   ```

2. **Node.js** - For the scansions export script

## Build Steps

### 1. Compile MBROLA to WASM

```bash
cd mbrola-wasm
./build.sh
```

This will:
- Clone MBROLA source from GitHub (if not present)
- Compile it to `mbrola.js` and `mbrola.wasm`

### 2. Export Scansions Dictionary

```bash
./export-scansions.sh
```

This creates `scansions.json` from the SQLite database.

### 3. Serve Files

Run a local web server from the project root:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

### 4. Open Demo

Navigate to `http://localhost:8000/mbrola-wasm/demo.html`

## Files

- `build.sh` - Emscripten build script for MBROLA
- `mbrola-wrapper.js` - JavaScript API wrapper for MBROLA WASM
- `poeta-browser.js` - Integration with synthesis.js pipeline
- `demo.html` - Browser demo page
- `export-scansions.sh` - Export scansions DB to JSON

## Generated Files (after build)

- `mbrola.js` - Emscripten glue code
- `mbrola.wasm` - WebAssembly binary
- `MBROLA/` - Cloned MBROLA source

## API Usage

```javascript
// Load required scripts
// <script src="synthesis.js"></script>
// <script src="mbrola-wasm/mbrola.js"></script>
// <script src="mbrola-wasm/mbrola-wrapper.js"></script>
// <script src="mbrola-wasm/poeta-browser.js"></script>

const poeta = new PoetaBrowser();

// Initialize with voice file and scansions dictionary
await poeta.init({
  voiceUrl: '/i',              // MBROLA Italian voice
  scansionsUrl: '/scansions.json'
});

// Synthesize and play
await poeta.speak('Arma virumque cano', 'lrlrlrlrlrla');

// Or get audio data
const { wav, pcm, sampleRate } = await poeta.synthesize(text, meter);

// Download as WAV
const url = URL.createObjectURL(wav);
```

## Meter Patterns

- `l` = long syllable
- `s` = short syllable
- `a` = anceps (either long or short)
- `r` = resolvable (long or two shorts)

Common patterns:
- Dactylic Hexameter: `lrlrlrlrlrla`
- Hendecasyllable: `aalsslalass`
- Sapphic: `laalaasslax`

## License

MBROLA is licensed under GNU Affero General Public License v3.
