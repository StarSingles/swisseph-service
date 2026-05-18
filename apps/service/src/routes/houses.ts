import { Hono } from "hono";
import { computeHouses } from "../ephemeris/houses";
import { applySiderealMode, ayanamsaToSidMode } from "../ephemeris/sidereal";
import { loadSwissEph } from "../ephemeris/wasm-loader";
import { jsonError } from "../errors";
import { HousesInput } from "../schemas/birth-data";

export const housesRoute = new Hono();

housesRoute.post("/", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = HousesInput.safeParse(raw);
  if (!parsed.success) {
    return jsonError(c, "invalid_input", "Invalid input", parsed.error.flatten());
  }
  const { jd, latitude, longitude, system, includeExtended, zodiac, ayanamsa } = parsed.data;
  const { exports } = await loadSwissEph();

  if (zodiac === "sidereal" && ayanamsa) {
    // Sticky global state — set mode every sidereal call. See sidereal.ts.
    applySiderealMode(exports, ayanamsaToSidMode(ayanamsa));
  }

  const result = computeHouses(exports, jd, latitude, longitude, system, zodiac === "sidereal");
  if (!result) {
    return jsonError(c, "infeasible", `swe_houses_ex failed at lat=${latitude}, system=${system}`);
  }

  const response: Record<string, unknown> = {
    cusps: result.cusps,
    ascendant: result.basic.ascendant,
    midheaven: result.basic.midheaven,
    system,
  };
  if (includeExtended) {
    response.extendedAngles = result.extended;
  }
  return c.json(response);
});
