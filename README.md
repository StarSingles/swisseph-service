# swisseph-service

A Cloudflare Worker wrapping the [Swiss Ephemeris](https://www.astro.com/swisseph/) astronomical library, exposing a JSON API and a small test UI.

## License

AGPL-3.0. See `LICENSE`. Based on the Swiss Ephemeris library by Astrodienst AG, used here under its AGPL option. Commercial users should obtain a Professional License directly from Astrodienst.

## Public endpoints

- Production: <https://swisseph.starsingles.app>
- Staging API: <https://staging-api.swisseph.starsingles.app>

## Development

Requirements: Node 22, pnpm 10, Docker (for WASM build), Wrangler.

```bash
pnpm install
pnpm wasm:build      # builds apps/service/src/wasm/libswephe.wasm in Docker
pnpm dev             # wrangler dev + astro dev
pnpm test            # all tests
```

See `build/README.md` for the WASM build pipeline.
