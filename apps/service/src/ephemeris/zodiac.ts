export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export function longitudeToSign(longitude: number): { sign: ZodiacSign; degreeInSign: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return {
    sign: ZODIAC_SIGNS[index] as ZodiacSign,
    degreeInSign: normalized - index * 30,
  };
}
