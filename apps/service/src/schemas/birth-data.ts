import { z } from "zod";

export const JulianDayInput = z.object({
  year: z.number().int().min(-4000).max(4000),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().min(0).max(24).default(0),
});
export type JulianDayInput = z.infer<typeof JulianDayInput>;
