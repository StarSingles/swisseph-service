import type { BirthData, PlanetBody } from "../schemas/birth-data";
import type { PlanetPosition } from "../schemas/responses";
import { SE_GREG_CAL, SEFLG_MOSEPH, SEFLG_SPEED } from "./swe-constants";
import { loadSwissEph } from "./wasm-loader";
import { longitudeToSign } from "./zodiac";

// Moshier (analytical) — no ephemeris files needed, accuracy ~0.1" for Sun,
// ~1" for Moon. Required because the WASM build has no filesystem for SE1 files.
const FLAGS = SEFLG_SPEED | SEFLG_MOSEPH;

const BODIES: { name: PlanetBody; ipl: number }[] = [
  { name: "Sun", ipl: 0 },
  { name: "Moon", ipl: 1 },
  { name: "Mercury", ipl: 2 },
  { name: "Venus", ipl: 3 },
  { name: "Mars", ipl: 4 },
  { name: "Jupiter", ipl: 5 },
  { name: "Saturn", ipl: 6 },
  { name: "Uranus", ipl: 7 },
  { name: "Neptune", ipl: 8 },
  { name: "Pluto", ipl: 9 },
];

export type ComputedBirthChart = {
  jd: number;
  bodies: PlanetPosition[];
  houses: { cusps: number[]; system: string } | null;
  angles: { ascendant: number; midheaven: number } | null;
  warnings: string[];
};

export async function computeBirthChart(input: BirthData): Promise<ComputedBirthChart> {
  const { exports } = await loadSwissEph();
  const warnings: string[] = [];

  const [year, month, day] = input.date.split("-").map(Number) as [number, number, number];
  const hasTime = input.time !== undefined;
  const hour = hasTime ? parseHourFraction(input.time as string) : 12; // noon fallback for body positions only
  const jd = exports.swe_julday(year, month, day, hour, SE_GREG_CAL);

  const bodies: PlanetPosition[] = [];
  const xx = exports.malloc(6 * 8);
  const serr = exports.malloc(256);
  try {
    for (const b of BODIES) {
      const rc = exports.swe_calc_ut(jd, b.ipl, FLAGS, xx, serr);
      if (rc < 0) throw new Error(`swe_calc_ut failed for ${b.name}`);
      const f64 = new Float64Array(exports.memory.buffer, xx, 6);
      const longitude = f64[0] as number;
      const speedLongitude = f64[3] as number;
      const { sign, degreeInSign } = longitudeToSign(longitude);
      bodies.push({
        body: b.name,
        longitude,
        latitude: f64[1] as number,
        speedLongitude,
        sign,
        degreeInSign,
        retrograde: speedLongitude < 0,
      });
    }
  } finally {
    exports.free(xx);
    exports.free(serr);
  }

  let houses: ComputedBirthChart["houses"] = null;
  let angles: ComputedBirthChart["angles"] = null;

  if (!hasTime) {
    warnings.push("birth time not provided — ascendant and houses omitted");
  } else {
    const cuspsPtr = exports.malloc(13 * 8);
    const ascmcPtr = exports.malloc(10 * 8);
    try {
      const rc = exports.swe_houses(
        jd,
        input.latitude,
        input.longitude,
        input.system.charCodeAt(0),
        cuspsPtr,
        ascmcPtr,
      );
      if (rc < 0) {
        warnings.push(`house system ${input.system} infeasible at this latitude — houses omitted`);
      } else {
        const cusps = Array.from(new Float64Array(exports.memory.buffer, cuspsPtr, 13)).slice(1);
        const ascmc = new Float64Array(exports.memory.buffer, ascmcPtr, 10);
        houses = { cusps, system: input.system };
        angles = { ascendant: ascmc[0] as number, midheaven: ascmc[1] as number };
      }
    } finally {
      exports.free(cuspsPtr);
      exports.free(ascmcPtr);
    }
  }

  return { jd, bodies, houses, angles, warnings };
}

function parseHourFraction(time: string): number {
  const [hh, mm, ss = "0"] = time.split(":");
  return Number(hh) + Number(mm) / 60 + Number(ss) / 3600;
}
