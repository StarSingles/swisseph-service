import { z } from "zod";

export const JulianDayInput = z.object({
  year: z.number().int().min(-4000).max(4000),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().min(0).max(24).default(0),
});
export type JulianDayInput = z.infer<typeof JulianDayInput>;

export const PlanetBody = z.enum([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "MeanNode",
  "TrueNode",
  "Lilith",
  // Chiron deferred — requires seas_18.se1 ephemeris file (Moshier doesn't
  // cover minor bodies). Add once R2-mounted ephemeris files are wired up.
]);
export type PlanetBody = z.infer<typeof PlanetBody>;

export const PlanetPositionInput = z.object({
  jd: z.number(),
  body: PlanetBody,
});
export type PlanetPositionInput = z.infer<typeof PlanetPositionInput>;

export const HouseSystem = z.enum(["P", "K", "O", "R", "C", "E", "W", "B"]).default("P");
export type HouseSystem = z.infer<typeof HouseSystem>;

export const HousesInput = z.object({
  jd: z.number(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  system: HouseSystem,
});
export type HousesInput = z.infer<typeof HousesInput>;

export const BirthData = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  system: HouseSystem.default("P"),
  /**
   * Optional opt-in body list. Defaults to the classical 10 (Sun→Pluto)
   * when omitted. When provided, returns exactly these bodies in order.
   */
  bodies: z.array(PlanetBody).optional(),
});
export type BirthData = z.infer<typeof BirthData>;

export const AspectType = z.enum(["conjunction", "sextile", "square", "trine", "opposition"]);
export type AspectType = z.infer<typeof AspectType>;

export const Orbs = z
  .object({
    conjunction: z.number().min(0).max(15).default(8),
    sextile: z.number().min(0).max(15).default(4),
    square: z.number().min(0).max(15).default(8),
    trine: z.number().min(0).max(15).default(8),
    opposition: z.number().min(0).max(15).default(8),
  })
  .default({});
export type Orbs = z.infer<typeof Orbs>;

const PlanetPositionSchema = z.object({
  body: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  speedLongitude: z.number(),
  sign: z.string(),
  degreeInSign: z.number(),
  retrograde: z.boolean(),
});

export const AspectsInput = z.object({
  chartA: z.object({ bodies: z.array(PlanetPositionSchema) }),
  chartB: z.object({ bodies: z.array(PlanetPositionSchema) }),
  orbs: Orbs,
});
export type AspectsInput = z.infer<typeof AspectsInput>;
