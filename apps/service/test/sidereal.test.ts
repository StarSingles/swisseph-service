import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const J2000 = 2451545.0;

describe("POST /api/v1/planet-position — sidereal mode", () => {
  it("Sun longitude shifts by ~Lahiri ayanamsa under sidereal vs tropical", async () => {
    const trop = await post("/api/v1/planet-position", { jd: J2000, body: "Sun" });
    const sid = await post("/api/v1/planet-position", {
      jd: J2000,
      body: "Sun",
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    expect(trop.status).toBe(200);
    expect(sid.status).toBe(200);
    const tropData = await trop.json<{ longitude: number }>();
    const sidData = await sid.json<{ longitude: number }>();
    // Wrap into [0, 360)
    const diff = (((tropData.longitude - sidData.longitude) % 360) + 360) % 360;
    // Lahiri ayanamsa at J2000 ≈ 23.85°. Allow ±0.1° for math.
    expect(diff).toBeGreaterThan(23.7);
    expect(diff).toBeLessThan(24.0);
  });

  it("rejects sidereal without ayanamsa", async () => {
    const res = await post("/api/v1/planet-position", {
      jd: J2000,
      body: "Sun",
      zodiac: "sidereal",
    });
    expect(res.status).toBe(400);
  });

  it("sidereal then tropical: tropical not contaminated by sticky sid mode", async () => {
    // Run sidereal first to set sid mode
    const sid = await post("/api/v1/planet-position", {
      jd: J2000,
      body: "Moon",
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    expect(sid.status).toBe(200);
    // Then tropical — must NOT have ayanamsa applied
    const trop = await post("/api/v1/planet-position", { jd: J2000, body: "Moon" });
    expect(trop.status).toBe(200);
    const data = await trop.json<{ longitude: number }>();
    // J2000 Moon tropical longitude is approximately 217.7°. Sidereal under
    // Lahiri would be ~193.9°. Assert > 200° to catch sid-mode leak.
    expect(data.longitude).toBeGreaterThan(200);
    expect(data.longitude).toBeLessThan(230);
  });
});

describe("POST /api/v1/birth-chart — sidereal mode", () => {
  it("Sun longitude in birth-chart shifts under sidereal", async () => {
    const trop = await post("/api/v1/birth-chart", {
      date: "2000-01-01",
      time: "12:00",
      latitude: 47.3769,
      longitude: 8.5417,
      bodies: ["Sun"],
    });
    const sid = await post("/api/v1/birth-chart", {
      date: "2000-01-01",
      time: "12:00",
      latitude: 47.3769,
      longitude: 8.5417,
      bodies: ["Sun"],
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    const t = await trop.json<{ bodies: Array<{ longitude: number }> }>();
    const s = await sid.json<{ bodies: Array<{ longitude: number }> }>();
    const tropLon = (t.bodies[0] as { longitude: number }).longitude;
    const sidLon = (s.bodies[0] as { longitude: number }).longitude;
    const diff = (((tropLon - sidLon) % 360) + 360) % 360;
    expect(diff).toBeGreaterThan(23.7);
    expect(diff).toBeLessThan(24.0);
  });
});
