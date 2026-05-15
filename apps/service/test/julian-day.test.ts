import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const post = (path: string, body: unknown) =>
  SELF.fetch(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/v1/julian-day", () => {
  it("converts a known Gregorian date to its Julian Day", async () => {
    // 2000-01-01 12:00 UT corresponds to JD 2451545.0 exactly.
    const res = await post("/api/v1/julian-day", { year: 2000, month: 1, day: 1, hour: 12 });
    expect(res.status).toBe(200);
    const body = await res.json<{ jd: number }>();
    expect(body.jd).toBeCloseTo(2451545.0, 4);
  });

  it("rejects month=13", async () => {
    const res = await post("/api/v1/julian-day", { year: 2000, month: 13, day: 1 });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe("invalid_input");
  });
});
