import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import bach from "./fixtures/bach.json";
import diana from "./fixtures/diana.json";
import einstein from "./fixtures/einstein.json";
import greenwich from "./fixtures/greenwich-2000.json";
import polar from "./fixtures/polar.json";
import reykjavik from "./fixtures/reykjavik.json";
import sydney from "./fixtures/sydney.json";

type Fixture = {
  name: string;
  input: {
    date: string;
    time?: string;
    latitude: number;
    longitude: number;
    system?: string;
  };
  expected: {
    bodies: Record<string, { longitude: number; sign: string }>;
    houses?: { ascendant: number; midheaven: number };
  };
};

const fixtures: Fixture[] = [
  bach as Fixture,
  einstein as Fixture,
  diana as Fixture,
  reykjavik as Fixture,
  sydney as Fixture,
  polar as Fixture,
  greenwich as Fixture,
];

const LONGITUDE_TOLERANCE = 0.01;
const HOUSE_TOLERANCE = 0.05;

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("golden output fixtures", () => {
  for (const fx of fixtures) {
    it(`matches reference for ${fx.name}`, async () => {
      const res = await post("/api/v1/birth-chart", fx.input);
      expect(res.status).toBe(200);
      const body = await res.json<{
        bodies: { body: string; longitude: number; sign: string }[];
        houses: { cusps: number[] } | null;
        angles: { ascendant: number; midheaven: number } | null;
      }>();
      for (const [bodyName, expected] of Object.entries(fx.expected.bodies)) {
        const got = body.bodies.find((b) => b.body === bodyName);
        expect(got, `body ${bodyName} missing`).toBeDefined();
        expect(got!.longitude).toBeCloseTo(expected.longitude, Math.log10(1 / LONGITUDE_TOLERANCE));
        expect(got!.sign).toBe(expected.sign);
      }
      if (fx.expected.houses && body.angles) {
        expect(body.angles.ascendant).toBeCloseTo(
          fx.expected.houses.ascendant,
          Math.log10(1 / HOUSE_TOLERANCE),
        );
        expect(body.angles.midheaven).toBeCloseTo(
          fx.expected.houses.midheaven,
          Math.log10(1 / HOUSE_TOLERANCE),
        );
      }
    });
  }

  it("polar fixture omits houses with a warning", async () => {
    const res = await post("/api/v1/birth-chart", polar.input);
    const body = await res.json<{ houses: unknown; warnings: string[] }>();
    expect(body.houses).toBeNull();
    expect(body.warnings.some((w) => w.includes("infeasible"))).toBe(true);
  });
});
