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
});
export type BirthData = z.infer<typeof BirthData>;
