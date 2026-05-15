#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_TAG="swisseph-wasi-build:latest"
OUTPUT_DIR="${REPO_ROOT}/apps/service/src/wasm"
OUTPUT_FILE="${OUTPUT_DIR}/libswephe.wasm"

echo "==> Building Docker image"
docker build -t "${IMAGE_TAG}" "${REPO_ROOT}/build"

echo "==> Compiling Swiss Ephemeris to WebAssembly"
mkdir -p "${OUTPUT_DIR}"

docker run --rm \
  -v "${REPO_ROOT}:/work" \
  -w /work \
  "${IMAGE_TAG}" \
  bash -c '
    set -euo pipefail
    SRC_DIR=/work/upstream/swisseph
    OUT=/work/apps/service/src/wasm/libswephe.wasm

    # Core Swiss Ephemeris library sources (exclude files with main():
    # obama.c, swemini.c, swephgen4.c, swetest.c, swevents.c)
    # sweephe4.c is for optional precomputed ep4_ ephemeris files; skip for now.
    SOURCES="swecl.c swedate.c swehel.c swehouse.c swejpl.c swemmoon.c swemplan.c sweph.c swephlib.c"

    cd "${SRC_DIR}"
    echo "Sources: ${SOURCES}"

    /opt/wasi-sdk/bin/clang \
      --target=wasm32-wasi \
      --sysroot=/opt/wasi-sdk/share/wasi-sysroot \
      -O2 \
      -DNO_JPL_HORIZONS \
      -DNO_SWE_GLP \
      -I"${SRC_DIR}" \
      -Wl,--export-dynamic \
      -Wl,--no-entry \
      ${SOURCES} \
      -o "${OUT}"

    echo "==> Built $(ls -lh "${OUT}" | awk "{print \$5\"  \"\$9}")"
  '

echo "==> Done. Output: ${OUTPUT_FILE}"
