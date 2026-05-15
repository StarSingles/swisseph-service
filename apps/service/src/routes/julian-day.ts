import { Hono } from "hono";
import { loadSwissEph } from "../ephemeris/wasm-loader";
import { jsonError } from "../errors";
import { JulianDayInput } from "../schemas/birth-data";

const SE_GREG_CAL = 1;

export const julianDayRoute = new Hono();

julianDayRoute.post("/", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = JulianDayInput.safeParse(raw);
  if (!parsed.success) {
    return jsonError(c, "invalid_input", "Invalid Julian Day input", parsed.error.flatten());
  }
  const { year, month, day, hour } = parsed.data;
  const { exports } = await loadSwissEph();
  const jd = exports.swe_julday(year, month, day, hour, SE_GREG_CAL);
  return c.json({ jd });
});
