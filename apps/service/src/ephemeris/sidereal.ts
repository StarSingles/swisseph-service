import type { Ayanamsa } from "../schemas/birth-data";
import type { SwissEphExports } from "../wasm/libswephe.wasm";
import {
  SE_SIDM_DELUCE,
  SE_SIDM_DJWHALKHUL,
  SE_SIDM_FAGAN_BRADLEY,
  SE_SIDM_KRISHNAMURTI,
  SE_SIDM_LAHIRI,
  SE_SIDM_RAMAN,
} from "./swe-constants";

export function ayanamsaToSidMode(name: Ayanamsa): number {
  switch (name) {
    case "lahiri":
      return SE_SIDM_LAHIRI;
    case "fagan_bradley":
      return SE_SIDM_FAGAN_BRADLEY;
    case "krishnamurti":
      return SE_SIDM_KRISHNAMURTI;
    case "raman":
      return SE_SIDM_RAMAN;
    case "deluce":
      return SE_SIDM_DELUCE;
    case "djwhal_khul":
      return SE_SIDM_DJWHALKHUL;
  }
}

/**
 * Selects the sidereal ayanamsa mode in the WASM module. MUST be called
 * immediately before any swe_calc_ut/swe_houses_ex call that uses
 * SEFLG_SIDEREAL — the mode is process-global state and concurrent requests
 * in the same isolate can interleave otherwise.
 */
export function applySiderealMode(exports: SwissEphExports, mode: number): void {
  exports.swe_set_sid_mode(mode, 0, 0);
}
