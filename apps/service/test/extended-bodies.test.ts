import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const J2000 = 2451545.0;

describe("POST /api/v1/planet-position — extended bodies", () => {
  // Bounded astrological tolerances — catch obvious implementation bugs
  // (wrong ipl, wrong flags). Golden fixtures (separate test) catch drift.
  it.each([
    // At J2000.0, Mean Node and True Node are both around 4-5° Leo (~125°).
    ["MeanNode", 120, 130],
    ["TrueNode", 120, 130],
    // Mean Lilith (Mean Apogee) at J2000.0 is in Sagittarius (~263°).
    ["Lilith", 255, 270],
  ])("returns longitude for %s at J2000 between %s° and %s°", async (body, lo, hi) => {
    const res = await post("/api/v1/planet-position", { jd: J2000, body });
    expect(res.status).toBe(200);
    const data = await res.json<{ longitude: number; body: string }>();
    expect(data.body).toBe(body);
    expect(data.longitude).toBeGreaterThan(lo);
    expect(data.longitude).toBeLessThan(hi);
  });

  it("rejects unknown body 'Sedna'", async () => {
    const res = await post("/api/v1/planet-position", { jd: J2000, body: "Sedna" });
    expect(res.status).toBe(400);
  });

  it("does NOT accept Chiron (Moshier doesn't cover minor bodies)", async () => {
    const res = await post("/api/v1/planet-position", { jd: J2000, body: "Chiron" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/birth-chart — bodies opt-in", () => {
  it("returns default 10 bodies when bodies omitted", async () => {
    const res = await post("/api/v1/birth-chart", {
      date: "2000-01-01",
      time: "12:00",
      latitude: 47.3769,
      longitude: 8.5417,
    });
    expect(res.status).toBe(200);
    const data = await res.json<{ bodies: { body: string }[] }>();
    expect(data.bodies.map((b) => b.body)).toEqual([
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
  });

  it("returns only requested bodies when bodies provided (in given order)", async () => {
    const res = await post("/api/v1/birth-chart", {
      date: "2000-01-01",
      time: "12:00",
      latitude: 47.3769,
      longitude: 8.5417,
      bodies: ["Sun", "Moon", "MeanNode", "Lilith"],
    });
    expect(res.status).toBe(200);
    const data = await res.json<{ bodies: { body: string }[] }>();
    expect(data.bodies.map((b) => b.body)).toEqual(["Sun", "Moon", "MeanNode", "Lilith"]);
  });
});
