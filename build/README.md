# WASM build pipeline

Builds `libswephe.wasm` from the upstream Swiss Ephemeris C source pinned in `upstream/swisseph`.

## Toolchain

- Debian 12 + WASI SDK 24 (pinned in `Dockerfile`)
- Clang from WASI SDK; targets `wasm32-wasi`

## How to build

```bash
pnpm wasm:build
```

That invokes `build/build.sh`, which:

1. Builds the Docker image (cached).
2. Runs the container with the repo bind-mounted at `/work`.
3. Inside the container, compiles the C source from `upstream/swisseph/` into `apps/service/src/wasm/libswephe.wasm`.

The artifact is gitignored; CI rebuilds it on every PR.

## Updating WASI SDK

Bump `WASI_SDK_VERSION` and `WASI_SDK_FULL` in the Dockerfile. Re-run `pnpm wasm:build` and `pnpm test` — golden fixtures must still pass.
