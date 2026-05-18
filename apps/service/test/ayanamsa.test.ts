import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/v1/ayanamsa", () => {
  it("returns Lahiri ayanamsa at J2000 ≈ 23.85°", async () => {
    const res = await post("/api/v1/ayanamsa", {
      jd: 2451545.0,
      ayanamsa: "lahiri",
    });
    expect(res.status).toBe(200);
    const data = await res.json<{
      ayanamsa: string;
      jd: number;
      offsetDegrees: number;
    }>();
    expect(data.ayanamsa).toBe("lahiri");
    expect(data.jd).toBe(2451545.0);
    expect(data.offsetDegrees).toBeGreaterThan(23.7);
    expect(data.offsetDegrees).toBeLessThan(24.0);
  });

  it("Fagan/Bradley and Lahiri ayanamsas differ by ~0.88° at J2000", async () => {
    const lahiri = await post("/api/v1/ayanamsa", {
      jd: 2451545.0,
      ayanamsa: "lahiri",
    });
    const fagan = await post("/api/v1/ayanamsa", {
      jd: 2451545.0,
      ayanamsa: "fagan_bradley",
    });
    expect(lahiri.status).toBe(200);
    expect(fagan.status).toBe(200);
    const lData = await lahiri.json<{ offsetDegrees: number }>();
    const fData = await fagan.json<{ offsetDegrees: number }>();
    const delta = Math.abs(lData.offsetDegrees - fData.offsetDegrees);
    // Lahiri and Fagan/Bradley differ by approximately 0.88° at J2000.
    expect(delta).toBeGreaterThan(0.5);
    expect(delta).toBeLessThan(1.2);
  });

  it("rejects unknown ayanamsa", async () => {
    const res = await post("/api/v1/ayanamsa", {
      jd: 2451545.0,
      ayanamsa: "sasanian",
    });
    expect(res.status).toBe(400);
  });

  it("rejects missing fields", async () => {
    const res = await post("/api/v1/ayanamsa", { julianDay: 2451545.0 });
    expect(res.status).toBe(400);
  });
});
