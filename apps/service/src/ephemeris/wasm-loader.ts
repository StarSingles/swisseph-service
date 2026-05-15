import type { SwissEphExports } from "../wasm/libswephe.wasm";
import wasmModule from "../wasm/libswephe.wasm";

let cached: { exports: SwissEphExports; version: string } | null = null;

export async function loadSwissEph() {
  if (cached) return cached;

  const wasiImports = makeMinimalWasiImports();
  const instance = await WebAssembly.instantiate(wasmModule, {
    wasi_snapshot_preview1: wasiImports,
    env: wasiImports,
  });
  const exports = instance.exports as unknown as SwissEphExports;

  // Reactor-mode WASM must be initialized before any other call.
  exports._initialize();

  const version = readVersion(exports);

  cached = { exports, version };
  return cached;
}

function readVersion(exports: SwissEphExports): string {
  const ptr = exports.malloc(64);
  try {
    exports.swe_version(ptr);
    return readCString(exports.memory, ptr);
  } finally {
    exports.free(ptr);
  }
}

function readCString(memory: WebAssembly.Memory, ptr: number): string {
  const bytes = new Uint8Array(memory.buffer, ptr);
  let end = 0;
  while (bytes[end] !== 0 && end < 256) end++;
  return new TextDecoder().decode(bytes.subarray(0, end));
}

/**
 * swisseph uses very little WASI surface — mostly nothing. We stub the
 * minimum required for the module to instantiate. The Proxy fallback returns
 * a no-op for any import the WASM requests that we haven't listed explicitly.
 */
function makeMinimalWasiImports() {
  const noop = () => 0;
  const handlers: Record<string, (...args: unknown[]) => unknown> = {
    proc_exit: (code: unknown) => {
      throw new Error(`WASM called proc_exit(${code})`);
    },
    fd_close: noop,
    fd_seek: noop,
    fd_write: noop,
    fd_read: noop,
    fd_fdstat_get: noop,
    fd_prestat_get: noop,
    fd_prestat_dir_name: noop,
    environ_sizes_get: noop,
    environ_get: noop,
    clock_time_get: noop,
    args_get: noop,
    args_sizes_get: noop,
  };
  return new Proxy(handlers, {
    get: (target, prop: string) => (prop in target ? target[prop] : noop),
  });
}
