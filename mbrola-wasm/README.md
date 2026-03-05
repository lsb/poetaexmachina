# MBROLA WebAssembly Build

This directory contains the build tooling for compiling MBROLA to WebAssembly. The compiled output (`mbrola.js`, `mbrola.wasm`) is placed in the project root alongside the other app files.

## Prerequisites

1. **Docker** - Used to run the Emscripten compiler
2. **Node.js** - For the scansions export script
3. **SQLite3** - For exporting the scansions database

## Build Steps

### 1. Compile MBROLA to WASM

```bash
./mbrola-wasm/build.sh
```

This clones MBROLA source (if needed) and compiles it to `mbrola.js` and `mbrola.wasm` in the project root.

### 2. Export Scansions Dictionary

```bash
./mbrola-wasm/export-scansions.sh
```

Creates `scansions.json` in the project root from the SQLite database.

### 3. Serve and Open

```bash
python3 -m http.server -b 127.0.0.1 8000
open http://localhost:8000
```

## Files

- `build.sh` - Emscripten build script (outputs to project root)
- `export-scansions.sh` - Export scansions DB to JSON
- `MBROLA/` - Cloned MBROLA C source code
- `test-wasm.js` - Node.js test for WASM module
- `test-full-pipeline.js` - Node.js test for full Latin-to-audio pipeline
