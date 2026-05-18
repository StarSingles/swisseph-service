/**
 * Numeric constants from upstream/swisseph/swephexp.h, pinned here so we
 * don't sprinkle magic numbers across the codebase. Values verified against
 * the header at build/upstream pinning time — if you bump the swisseph
 * submodule, re-grep swephexp.h and update.
 */

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
export const SE_CHIRON = 15;

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
// Upstream name: SE_SIDM_DJWHAL_KHUL (note underscore between DJWHAL and KHUL).
// Value is 6, not 7 — the plan table had a typo; SE_SIDM_YUKTESHWAR = 7.
export const SE_SIDM_DJWHALKHUL = 6;

// Gregorian calendar flag for swe_julday.
export const SE_GREG_CAL = 1;
