# swisseph-service

[![CI](https://github.com/starsingles/swisseph-service/actions/workflows/ci.yml/badge.svg)](https://github.com/starsingles/swisseph-service/actions/workflows/ci.yml)

A Cloudflare Worker wrapping the [Swiss Ephemeris](https://www.astro.com/swisseph/) astronomical library, exposing a small JSON API and a test web UI.

- Production: <https://swisseph.starsingles.app>
- Staging API: <https://staging-api.swisseph.starsingles.app>

## License

AGPL-3.0. Built on the Swiss Ephemeris by Astrodienst AG, used here under its AGPL option.

**Commercial users must obtain a [Professional License](https://www.astro.com/swisseph/swephprice_e.htm) from Astrodienst** — calling this service over HTTPS from closed-source software is legally grey and not recommended without that license. See the design doc for the full reasoning.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness, swisseph version |
| POST | `/api/v1/julian-day` | Gregorian date → Julian Day |
| POST | `/api/v1/planet-position` | One planet's position at one moment |
| POST | `/api/v1/houses` | 12 house cusps + Ascendant + MC |
| POST | `/api/v1/birth-chart` | Full chart: 10 bodies + houses + angles |
| POST | `/api/v1/aspects` | Aspect grid between two birth charts |

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
