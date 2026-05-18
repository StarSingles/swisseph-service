/**
 * Numeric constants from upstream/swisseph/swephexp.h, pinned here so we
 * don't sprinkle magic numbers across the codebase. Values verified against
 * the header at build/upstream pinning time — if you bump the swisseph
 * submodule, re-grep swephexp.h and update.
 */

import type { PlanetBody } from "../schemas/birth-data";

// Body identifiers — used as the `ipl` argument to swe_calc_ut.
export const SE_SUN = 0;
export const SE_MOON = 1;
export const SE_MERCURY = 2;
export const SE_VENUS = 3;
export const SE_MARS = 4;
export const SE_JUPITER = 5;
export const SE_SATURN = 6;
export const SE_URANUS = 7;
export const SE_NEPTUNE = 8;
export const SE_PLUTO = 9;
export const SE_MEAN_NODE = 10;
export const SE_TRUE_NODE = 11;
export const SE_MEAN_APOG = 12; // "Lilith"
// Note: 13 (SE_OSCU_APOG) and 14 (SE_EARTH) intentionally skipped — not needed.
export const SE_CHIRON = 15;

// Canonical mapping from PlanetBody name → swe_calc_ut ipl number.
// Shared by planet-position.ts and chart.ts to avoid duplication. Typed as
// Record<PlanetBody, number> so adding a new enum member without updating
// this map fails at compile time.
export const BODY_TO_IPL: Record<PlanetBody, number> = {
  Sun: SE_SUN,
  Moon: SE_MOON,
  Mercury: SE_MERCURY,
  Venus: SE_VENUS,
  Mars: SE_MARS,
  Jupiter: SE_JUPITER,
  Saturn: SE_SATURN,
  Uranus: SE_URANUS,
  Neptune: SE_NEPTUNE,
  Pluto: SE_PLUTO,
  MeanNode: SE_MEAN_NODE,
  TrueNode: SE_TRUE_NODE,
  Lilith: SE_MEAN_APOG,
};

// Calculation flags — bitmask, combined with `|`.
export const SEFLG_SPEED = 256;
export const SEFLG_MOSEPH = 4; // Moshier — analytical, no .se1 files
export const SEFLG_SIDEREAL = 65536; // 1 << 16  (= 64*1024 in the header)

// Sidereal modes — argument to swe_set_sid_mode(mode, 0, 0).
export const SE_SIDM_FAGAN_BRADLEY = 0;
export const SE_SIDM_LAHIRI = 1;
export const SE_SIDM_DELUCE = 2;
export const SE_SIDM_RAMAN = 3;
export const SE_SIDM_KRISHNAMURTI = 5;
// Upstream header name is SE_SIDM_DJWHAL_KHUL (with the extra underscore);
// exported without it for symmetry with the other SIDM_* identifiers.
// Value confirmed 6 in swephexp.h — SE_SIDM_YUKTESHWAR is the one at 7.
export const SE_SIDM_DJWHALKHUL = 6;

// Gregorian calendar flag for swe_julday.
export const SE_GREG_CAL = 1;
