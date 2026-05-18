# swisseph-service

[![CI](https://github.com/starsingles/swisseph-service/actions/workflows/ci.yml/badge.svg)](https://github.com/starsingles/swisseph-service/actions/workflows/ci.yml)

A Cloudflare Worker wrapping the [Swiss Ephemeris](https://www.astro.com/swisseph/) astronomical library, exposing a small JSON API and a test web UI.

## License

AGPL-3.0. Built on the Swiss Ephemeris by Astrodienst AG, used here under its AGPL option. If you call this service from a closed-source project, obtain a [Professional License](https://www.astro.com/swisseph/swephprice_e.htm) from Astrodienst.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness, swisseph version |
| POST | `/api/v1/julian-day` | Gregorian date → Julian Day |
| POST | `/api/v1/planet-position` | One planet's position at one moment |
| POST | `/api/v1/houses` | 12 house cusps + Ascendant + MC |
| POST | `/api/v1/birth-chart` | Full chart: 10 bodies + houses + angles |
| POST | `/api/v1/aspects` | Aspect grid between two birth charts |
| POST | `/api/v1/ayanamsa` | Sidereal ayanamsa offset for a given JD |

### Optional cross-cutting fields

`/planet-position`, `/birth-chart`, and `/houses` accept:

- `zodiac: "tropical" | "sidereal"` — default `tropical`. When `sidereal`, ecliptic longitudes and house cusps are shifted by the requested ayanamsa.
- `ayanamsa: "lahiri" | "fagan_bradley" | "krishnamurti" | "raman" | "deluce" | "djwhal_khul"` — required when `zodiac` is `sidereal`.

`/birth-chart` additionally accepts:

- `bodies: PlanetBody[]` — opt-in list. Defaults to Sun→Pluto when omitted. Supported names: `Sun`, `Moon`, `Mercury`, `Venus`, `Mars`, `Jupiter`, `Saturn`, `Uranus`, `Neptune`, `Pluto`, `MeanNode`, `TrueNode`, `Lilith`.

`/houses` additionally accepts:

- `includeExtended: boolean` — default `false`. When `true`, adds `extendedAngles` (vertex, equatorialAscendant, coAscendantKoch, coAscendantMunkasey, polarAscendant) to the response.

> **Note on Chiron and other minor bodies:** Chiron and asteroids beyond Pluto require Swiss Ephemeris `.se1` data files (Moshier covers only the classical 10 planets). The current WASM build has no filesystem mounts. These bodies will be added once R2-mounted ephemeris file infrastructure is in place.

## Development

Requirements: Node 22, pnpm 10, Docker, Wrangler.

```bash
git clone --recurse-submodules https://github.com/starsingles/swisseph-service
cd swisseph-service
pnpm install
pnpm wasm:build
pnpm test
pnpm --filter @swisseph/service dev
```

## Repository

- `apps/service` — the Cloudflare Worker (Hono + WASM)
- `apps/web` — Astro test UI
- `build/` — WASM build pipeline (Docker)
- `upstream/swisseph` — pinned Swiss Ephemeris C source (sub-submodule)
