import { Hono } from "hono";
import { computeAspects } from "../ephemeris/aspects";
import { jsonError } from "../errors";
import { AspectsInput } from "../schemas/birth-data";

export const aspectsRoute = new Hono();

aspectsRoute.post("/", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = AspectsInput.safeParse(raw);
  if (!parsed.success) {
    return jsonError(c, "invalid_input", "Invalid aspects input", parsed.error.flatten());
  }
  const aspects = computeAspects(parsed.data.chartA, parsed.data.chartB, parsed.data.orbs);
  return c.json({ aspects, orbsUsed: parsed.data.orbs });
});
