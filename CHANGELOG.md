# Changelog

## 2026-05-18 — Foundational completeness (slice A)

### Added
- Lunar nodes (`MeanNode`, `TrueNode`) and `Lilith` (Mean Apogee) body identifiers — opt-in via `bodies` on `/birth-chart`, or as the `body` value on `/planet-position`.
- Optional `zodiac` / `ayanamsa` parameters on `/planet-position`, `/birth-chart`, and `/houses`. Six ayanamsa modes: Lahiri, Fagan/Bradley, Krishnamurti, Raman, DeLuce, Djwhal Khul.
- New endpoint `POST /api/v1/ayanamsa` — returns the sidereal offset for a given Julian day and ayanamsa.
- `includeExtended: true` on `/houses` adds `extendedAngles` (vertex, equatorial ascendant, co-asc Koch, co-asc Munkasey, polar ascendant).
- UI: zodiac segmented control + extended-bodies toggle on `/chart`; `/ayanamsa` section on `/raw`.

### Changed
- `/birth-chart` accepts an optional `bodies` array. Default body set (Sun→Pluto) unchanged for callers who omit it.
- `/houses` internals switched from `swe_houses` to `swe_houses_ex`.

### Deferred
- Chiron and minor asteroids — require `.se1` data files. Awaiting R2-mounted ephemeris file infrastructure.

### Internal
- New WASM exports: `swe_houses_ex`, `swe_set_sid_mode`, `swe_get_ayanamsa_ex_ut`.
- New helpers: `ephemeris/swe-constants.ts` (pinned values), `ephemeris/sidereal.ts`, `ephemeris/houses.ts`, `ephemeris/wasm-helpers.ts`.
- BODY_TO_IPL consolidated, typed as `Record<PlanetBody, number>` for compile-time exhaustiveness.
