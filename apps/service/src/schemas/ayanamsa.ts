import { z } from "zod";
import { Ayanamsa } from "./birth-data";

export const AyanamsaInput = z.object({
  julianDay: z.number(),
  ayanamsa: Ayanamsa,
});
export type AyanamsaInput = z.infer<typeof AyanamsaInput>;
