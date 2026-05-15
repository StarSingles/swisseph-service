import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/v1/planet-position", () => {
  it("returns the Sun's position on 2000-01-01 12:00 UT in Capricorn", async () => {
    const res = await post("/api/v1/planet-position", { jd: 2451545.0, body: "Sun" });
    expect(res.status).toBe(200);
    const p = await res.json<{
      sign: string;
      degreeInSign: number;
      longitude: number;
      retrograde: boolean;
    }>();
    expect(p.sign).toBe("Capricorn");
    expect(p.longitude).toBeGreaterThan(279);
    expect(p.longitude).toBeLessThan(282);
    expect(p.retrograde).toBe(false);
  });

  it("rejects an unknown body", async () => {
    const res = await post("/api/v1/planet-position", { jd: 2451545.0, body: "Pizza" });
    expect(res.status).toBe(400);
  });
});
