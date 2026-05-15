import { Hono } from "hono";
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
  const { jd, latitude, longitude, system } = parsed.data;
  const { exports } = await loadSwissEph();

  const cuspsPtr = exports.malloc(13 * 8); // cusps[0..12], cusps[0] unused
  const ascmcPtr = exports.malloc(10 * 8);
  try {
    const rc = exports.swe_houses(
      jd,
      latitude,
      longitude,
      system.charCodeAt(0),
      cuspsPtr,
      ascmcPtr,
    );
    if (rc < 0) {
      return jsonError(c, "infeasible", `swe_houses failed at lat=${latitude}, system=${system}`);
    }
    const cusps = Array.from(new Float64Array(exports.memory.buffer, cuspsPtr, 13)).slice(1);
    const ascmc = new Float64Array(exports.memory.buffer, ascmcPtr, 10);
    return c.json({
      cusps,
      ascendant: ascmc[0] as number,
      midheaven: ascmc[1] as number,
      system,
    });
  } finally {
    exports.free(cuspsPtr);
    exports.free(ascmcPtr);
  }
});
