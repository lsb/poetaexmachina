#!/bin/bash
#
# Build script for compiling MBROLA to WebAssembly using Emscripten
#
# Uses the official Emscripten Docker image for reproducible builds.
#
# Usage:
#   ./build.sh
#
# Output:
#   - mbrola.js    - JavaScript glue code
#   - mbrola.wasm  - WebAssembly binary
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MBROLA_SRC="${SCRIPT_DIR}/MBROLA"
OUTPUT_DIR="${PROJECT_ROOT}"

# Clone MBROLA if not present
if [ ! -d "$MBROLA_SRC" ]; then
    echo "Cloning MBROLA source..."
    git clone --depth 1 https://github.com/numediart/MBROLA.git "$MBROLA_SRC"
fi

echo "Compiling MBROLA to WebAssembly using Docker..."

# Run emcc via Docker
# Mount the mbrola-wasm directory to /src in the container
# Work from inside the MBROLA directory so includes resolve correctly
docker run --rm -v "${PROJECT_ROOT}:/project" -w /project/mbrola-wasm/MBROLA emscripten/emsdk:latest \
    emcc \
    -DTARGET_OS_LINUX \
    -DLITTLE_ENDIAN \
    -Wno-implicit-function-declaration \
    -Wno-incompatible-function-pointer-types \
    -IParser \
    -IStandalone \
    -IMisc \
    -ILibOneChannel \
    -ILibMultiChannel \
    -IEngine \
    -IDatabase \
    LibOneChannel/lib1.c \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='createMbrolaModule' \
    -s EXPORTED_FUNCTIONS='["_init_MBR","_close_MBR","_reset_MBR","_read_MBR","_write_MBR","_flush_MBR","_getFreq_MBR","_setFreq_MBR","_setNoError_MBR","_setVolumeRatio_MBR","_lastError_MBR","_lastErrorStr_MBR","_resetError_MBR","_getVersion_MBR","_malloc","_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","stringToUTF8","UTF8ToString","getValue","setValue"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16777216 \
    -s FILESYSTEM=1 \
    -s FORCE_FILESYSTEM=1 \
    -O2 \
    -o /project/mbrola.js

echo ""
echo "Build complete!"
echo "  Output: ${OUTPUT_DIR}/mbrola.js"
echo "  Output: ${OUTPUT_DIR}/mbrola.wasm"
echo ""
echo "To use in browser, load mbrola.js and call createMbrolaModule()"
