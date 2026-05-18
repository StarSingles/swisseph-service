import { Hono } from "hono";
import { BODY_TO_IPL, SEFLG_MOSEPH, SEFLG_SPEED } from "../ephemeris/swe-constants";
import { loadSwissEph } from "../ephemeris/wasm-loader";
import { longitudeToSign } from "../ephemeris/zodiac";
import { jsonError } from "../errors";
import { PlanetPositionInput } from "../schemas/birth-data";
import type { PlanetPosition } from "../schemas/responses";

// Moshier (analytical) — no ephemeris files needed, accuracy ~0.1" for Sun, ~1" for Moon.
// Required because the WASM build has no filesystem access for SE1 ephemeris files.
const FLAGS = SEFLG_SPEED | SEFLG_MOSEPH;

export const planetPositionRoute = new Hono();

planetPositionRoute.post("/", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = PlanetPositionInput.safeParse(raw);
  if (!parsed.success) {
    return jsonError(c, "invalid_input", "Invalid input", parsed.error.flatten());
  }
  const { jd, body } = parsed.data;
  const { exports } = await loadSwissEph();

  const xx = exports.malloc(6 * 8); // 6 doubles
  const serr = exports.malloc(256);
  try {
    const rc = exports.swe_calc_ut(jd, BODY_TO_IPL[body], FLAGS, xx, serr);
    if (rc < 0) {
      const msg = readCString(exports.memory, serr);
      return jsonError(c, "wasm_error", `swe_calc_ut failed: ${msg}`);
    }
    const f64 = new Float64Array(exports.memory.buffer, xx, 6);
    const longitude = f64[0] as number;
    const latitude = f64[1] as number;
    const speedLongitude = f64[3] as number;
    const { sign, degreeInSign } = longitudeToSign(longitude);
    const result: PlanetPosition = {
      body,
      longitude,
      latitude,
      speedLongitude,
      sign,
      degreeInSign,
      retrograde: speedLongitude < 0,
    };
    return c.json(result);
  } finally {
    exports.free(xx);
    exports.free(serr);
  }
});

function readCString(memory: WebAssembly.Memory, ptr: number): string {
  const bytes = new Uint8Array(memory.buffer, ptr);
  let end = 0;
  while (bytes[end] !== 0 && end < 256) end++;
  return new TextDecoder().decode(bytes.subarray(0, end));
}
