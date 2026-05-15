import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const fakeBody = (body: string, longitude: number) => ({
  body,
  longitude,
  latitude: 0,
  speedLongitude: 1,
  sign: "Aries",
  degreeInSign: 0,
  retrograde: false,
});

describe("POST /api/v1/aspects", () => {
  it("identifies a conjunction when two bodies share a longitude", async () => {
    const res = await post("/api/v1/aspects", {
      chartA: { bodies: [fakeBody("Sun", 100)] },
      chartB: { bodies: [fakeBody("Sun", 102)] },
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ aspects: { type: string; orb: number }[] }>();
    expect(body.aspects[0]?.type).toBe("conjunction");
    expect(body.aspects[0]?.orb).toBeCloseTo(2, 5);
  });

  it("identifies an opposition at ~180 degrees", async () => {
    const res = await post("/api/v1/aspects", {
      chartA: { bodies: [fakeBody("Sun", 0)] },
      chartB: { bodies: [fakeBody("Sun", 179)] },
    });
    const body = await res.json<{ aspects: { type: string }[] }>();
    expect(body.aspects[0]?.type).toBe("opposition");
  });

  it("omits aspects beyond the orb", async () => {
    const res = await post("/api/v1/aspects", {
      chartA: { bodies: [fakeBody("Sun", 0)] },
      chartB: { bodies: [fakeBody("Sun", 45)] },
    });
    const body = await res.json<{ aspects: unknown[] }>();
    expect(body.aspects).toHaveLength(0);
  });
});
