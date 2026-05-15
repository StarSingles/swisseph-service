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
]);
export type PlanetBody = z.infer<typeof PlanetBody>;

export const PlanetPositionInput = z.object({
  jd: z.number(),
  body: PlanetBody,
});
export type PlanetPositionInput = z.infer<typeof PlanetPositionInput>;
