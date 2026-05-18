import type { HouseSystem } from "../schemas/birth-data";
import type { SwissEphExports } from "../wasm/libswephe.wasm";
import { SEFLG_SIDEREAL } from "./swe-constants";

export type BasicAngles = {
  ascendant: number;
  midheaven: number;
  armc: number;
};

export type ExtendedAngles = {
  vertex: number;
  equatorialAscendant: number;
  coAscendantKoch: number;
  coAscendantMunkasey: number;
  polarAscendant: number;
};

export type HousesResult = {
  cusps: number[]; // length 12
  basic: BasicAngles;
  extended: ExtendedAngles;
};

/**
 * Wraps swe_houses_ex. Returns basic + extended angles unconditionally — the
 * caller decides what to surface in the response. When `sidereal` is true,
 * the caller MUST have already applied the sidereal mode (sticky global
 * state in the WASM module — see sidereal.ts).
 *
 * Returns null when swe_houses_ex returns rc < 0 — typically the house
 * system is infeasible at the given latitude (e.g. Placidus near the poles).
 */
export function computeHouses(
  exports: SwissEphExports,
  jd: number,
  lat: number,
  lon: number,
  system: HouseSystem,
  sidereal: boolean,
): HousesResult | null {
  const flags = sidereal ? SEFLG_SIDEREAL : 0;

  const cuspsPtr = exports.malloc(13 * 8);
  const ascmcPtr = exports.malloc(10 * 8);
  try {
    const rc = exports.swe_houses_ex(jd, flags, lat, lon, system.charCodeAt(0), cuspsPtr, ascmcPtr);
    if (rc < 0) return null;

    const cusps = Array.from(new Float64Array(exports.memory.buffer, cuspsPtr, 13)).slice(1);
    const ascmc = new Float64Array(exports.memory.buffer, ascmcPtr, 10);
    return {
      cusps,
      basic: {
        ascendant: ascmc[0] as number,
        midheaven: ascmc[1] as number,
        armc: ascmc[2] as number,
      },
      extended: {
        vertex: ascmc[3] as number,
        equatorialAscendant: ascmc[4] as number,
        coAscendantKoch: ascmc[5] as number,
        coAscendantMunkasey: ascmc[6] as number,
        polarAscendant: ascmc[7] as number,
      },
    };
  } finally {
    exports.free(cuspsPtr);
    exports.free(ascmcPtr);
  }
}
