import type { ZodiacSign } from "../ephemeris/zodiac";

export type PlanetPosition = {
  body: string;
  longitude: number;
  latitude: number;
  speedLongitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  retrograde: boolean;
};
