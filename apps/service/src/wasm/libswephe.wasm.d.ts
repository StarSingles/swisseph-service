/**
 * Type declarations for libswephe.wasm exports we depend on.
 * Build pipeline: build/build.sh. Source: upstream/swisseph (pinned).
 *
 * All swisseph functions follow C calling convention with pointer arguments
 * passed as i32 offsets into linear memory. JS glue (ephemeris/wasm-loader.ts)
 * handles allocation and marshalling.
 *
 * The WASM module is built in reactor mode — it also exports `_initialize`
 * which must be called once after instantiation. The loader handles this.
 */
export interface SwissEphExports {
  memory: WebAssembly.Memory;

  /** Reactor-mode initializer — must be called once after instantiation. */
  _initialize(): void;

  /** swe_calc_ut(tjd_ut: f64, ipl: i32, iflag: i32, xx: ptr, serr: ptr) -> i32 */
  swe_calc_ut(tjd_ut: number, ipl: number, iflag: number, xx: number, serr: number): number;

  /** swe_julday(year: i32, month: i32, day: i32, hour: f64, gregflag: i32) -> f64 */
  swe_julday(year: number, month: number, day: number, hour: number, gregflag: number): number;

  /** swe_houses(tjd_ut: f64, lat: f64, lon: f64, hsys: i32, cusps: ptr, ascmc: ptr) -> i32 */
  swe_houses(
    tjd_ut: number,
    lat: number,
    lon: number,
    hsys: number,
    cusps: number,
    ascmc: number,
  ): number;

  /** swe_set_ephe_path(path: ptr) -> void */
  swe_set_ephe_path(path: number): void;

  /** swe_close() -> void */
  swe_close(): void;

  /** swe_version(svers: ptr) -> ptr (writes version string into svers, returns same ptr) */
  swe_version(svers: number): number;

  /** Standard WASI memory allocator exports */
  malloc(size: number): number;
  free(ptr: number): void;
}

export const _module: WebAssembly.Module;
