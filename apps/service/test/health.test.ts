import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /api/v1/health", () => {
  it("returns ok=true and environment", async () => {
    const res = await SELF.fetch("https://example.com/api/v1/health");
    expect(res.status).toBe(200);
    const body = await res.json<{ ok: boolean; environment: string }>();
    expect(body.ok).toBe(true);
    expect(body.environment).toBe("production");
  });

  it("returns wasmLoaded=true once the WASM has been initialized", async () => {
    const res = await SELF.fetch("https://example.com/api/v1/health");
    const body = await res.json<{ wasmLoaded: boolean; swissephVersion: string }>();
    expect(body.wasmLoaded).toBe(true);
    expect(body.swissephVersion).not.toBe("unknown");
  });
});
