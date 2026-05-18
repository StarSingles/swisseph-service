import { Hono } from "hono";
import { applySiderealMode, ayanamsaToSidMode } from "../ephemeris/sidereal";
import { readCString } from "../ephemeris/wasm-helpers";
import { loadSwissEph } from "../ephemeris/wasm-loader";
import { jsonError } from "../errors";
import { AyanamsaInput } from "../schemas/ayanamsa";

export const ayanamsaRoute = new Hono();

ayanamsaRoute.post("/", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = AyanamsaInput.safeParse(raw);
  if (!parsed.success) {
    return jsonError(c, "invalid_input", "Invalid input", parsed.error.flatten());
  }
  const { jd, ayanamsa } = parsed.data;
  const { exports } = await loadSwissEph();

  // Sticky global state — set mode before reading the offset (see sidereal.ts).
  applySiderealMode(exports, ayanamsaToSidMode(ayanamsa));

  const daya = exports.malloc(8); // single f64
  const serr = exports.malloc(256);
  try {
    const rc = exports.swe_get_ayanamsa_ex_ut(jd, 0, daya, serr);
    if (rc < 0) {
      const msg = readCString(exports.memory, serr);
      return jsonError(c, "wasm_error", `swe_get_ayanamsa_ex_ut failed: ${msg}`);
    }
    const offsetDegrees = new Float64Array(exports.memory.buffer, daya, 1)[0] as number;
    return c.json({ ayanamsa, jd, offsetDegrees });
  } finally {
    exports.free(daya);
    exports.free(serr);
  }
});
