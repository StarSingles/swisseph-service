import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/v1/birth-chart", () => {
  it("returns all 10 bodies + houses + angles when time is provided", async () => {
    const res = await post("/api/v1/birth-chart", {
      date: "2000-01-01",
      time: "12:00",
      latitude: 47.3769,
      longitude: 8.5417,
    });
    expect(res.status).toBe(200);
    const body = await res.json<{
      bodies: { body: string }[];
      houses: { cusps: number[] } | null;
      angles: { ascendant: number } | null;
      warnings: string[];
    }>();
    expect(body.bodies.map((b) => b.body)).toEqual([
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
    ]);
    expect(body.houses?.cusps).toHaveLength(12);
    expect(body.angles?.ascendant).toBeGreaterThanOrEqual(0);
    expect(body.warnings).toEqual([]);
  });

  it("omits houses/angles with a warning when time is missing", async () => {
    const res = await post("/api/v1/birth-chart", {
      date: "2000-01-01",
      latitude: 47.3769,
      longitude: 8.5417,
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ houses: unknown; angles: unknown; warnings: string[] }>();
    expect(body.houses).toBeNull();
    expect(body.angles).toBeNull();
    expect(body.warnings).toContain("birth time not provided — ascendant and houses omitted");
  });
});
