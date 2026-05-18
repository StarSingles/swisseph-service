import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const J2000 = 2451545.0;
const NYC_LAT = 40.7128;
const NYC_LON = -74.006;

describe("POST /api/v1/houses — extended angles", () => {
  it("default shape unchanged when includeExtended omitted", async () => {
    const res = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
    });
    expect(res.status).toBe(200);
    const data = await res.json<Record<string, unknown>>();
    expect(data).not.toHaveProperty("extendedAngles");
    expect(data).toHaveProperty("cusps");
    expect(data).toHaveProperty("ascendant");
    expect(data).toHaveProperty("midheaven");
  });

  it("returns extendedAngles when includeExtended=true", async () => {
    const res = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
      includeExtended: true,
    });
    expect(res.status).toBe(200);
    const data = await res.json<{
      extendedAngles: {
        vertex: number;
        equatorialAscendant: number;
        coAscendantKoch: number;
        coAscendantMunkasey: number;
        polarAscendant: number;
      };
    }>();
    expect(data.extendedAngles.vertex).toBeGreaterThanOrEqual(0);
    expect(data.extendedAngles.vertex).toBeLessThan(360);
    expect(data.extendedAngles.equatorialAscendant).toBeGreaterThanOrEqual(0);
    expect(data.extendedAngles.equatorialAscendant).toBeLessThan(360);
    expect(data.extendedAngles.coAscendantKoch).toBeGreaterThanOrEqual(0);
    expect(data.extendedAngles.coAscendantKoch).toBeLessThan(360);
    expect(data.extendedAngles.coAscendantMunkasey).toBeGreaterThanOrEqual(0);
    expect(data.extendedAngles.coAscendantMunkasey).toBeLessThan(360);
    expect(data.extendedAngles.polarAscendant).toBeGreaterThanOrEqual(0);
    expect(data.extendedAngles.polarAscendant).toBeLessThan(360);
  });

  it("sidereal mode shifts ascendant by ~Lahiri ayanamsa", async () => {
    const trop = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
    });
    const sid = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    expect(trop.status).toBe(200);
    expect(sid.status).toBe(200);
    const t = await trop.json<{ ascendant: number }>();
    const s = await sid.json<{ ascendant: number }>();
    const diff = (((t.ascendant - s.ascendant) % 360) + 360) % 360;
    expect(diff).toBeGreaterThan(23.7);
    expect(diff).toBeLessThan(24.0);
  });

  it("sidereal mode shifts cusps", async () => {
    const trop = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
    });
    const sid = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    const t = await trop.json<{ cusps: number[] }>();
    const s = await sid.json<{ cusps: number[] }>();
    // House 6 cusp — a mid-chart cusp, distinct from the Ascendant, so this
    // exercises the shift on cusps other than house 1.
    const diff = ((((t.cusps[5] as number) - (s.cusps[5] as number)) % 360) + 360) % 360;
    expect(diff).toBeGreaterThan(23.7);
    expect(diff).toBeLessThan(24.0);
  });

  it("sidereal then tropical: tropical cusps not contaminated by sticky sid mode", async () => {
    // Set sidereal mode first
    const sid = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    expect(sid.status).toBe(200);
    // Then tropical — must NOT have ayanamsa applied to the cusps
    const trop = await post("/api/v1/houses", {
      jd: J2000,
      latitude: NYC_LAT,
      longitude: NYC_LON,
      system: "P",
    });
    expect(trop.status).toBe(200);
    const data = await trop.json<{ ascendant: number }>();
    // Tropical ASC is ~274° at NYC J2000. Sidereal under Lahiri would be ~250°.
    // Assert > 265° to catch a sid-mode leak through the SEFLG_SIDEREAL guard.
    expect(data.ascendant).toBeGreaterThan(265);
  });
});
