import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/v1/houses", () => {
  it("returns 12 cusps + ascendant + midheaven for Zurich on 2000-01-01 12:00 UT", async () => {
    const res = await post("/api/v1/houses", {
      jd: 2451545.0,
      latitude: 47.3769,
      longitude: 8.5417,
      system: "P",
    });
    expect(res.status).toBe(200);
    const body = await res.json<{
      cusps: number[];
      ascendant: number;
      midheaven: number;
      system: string;
    }>();
    expect(body.cusps).toHaveLength(12);
    expect(body.ascendant).toBeGreaterThanOrEqual(0);
    expect(body.ascendant).toBeLessThan(360);
    expect(body.midheaven).toBeGreaterThanOrEqual(0);
    expect(body.system).toBe("P");
  });

  it("rejects latitude=91", async () => {
    const res = await post("/api/v1/houses", { jd: 2451545.0, latitude: 91, longitude: 0 });
    expect(res.status).toBe(400);
  });
});
