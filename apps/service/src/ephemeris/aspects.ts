import type { AspectType, Orbs } from "../schemas/birth-data";

const PERFECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

export type Aspect = {
  bodyA: string;
  bodyB: string;
  type: AspectType;
  angle: number;
  orb: number;
};

type AspectBody = { body: string; longitude: number };

export function computeAspects(
  chartA: { bodies: AspectBody[] },
  chartB: { bodies: AspectBody[] },
  orbs: Orbs,
): Aspect[] {
  const aspects: Aspect[] = [];
  for (const a of chartA.bodies) {
    for (const b of chartB.bodies) {
      const angle = normalizedSeparation(a.longitude, b.longitude);
      const match = closestAspect(angle, orbs);
      if (match) {
        aspects.push({ bodyA: a.body, bodyB: b.body, type: match.type, angle, orb: match.orb });
      }
    }
  }
  return aspects;
}

function normalizedSeparation(longA: number, longB: number): number {
  const raw = Math.abs((((longA - longB) % 360) + 360) % 360);
  return raw > 180 ? 360 - raw : raw;
}

function closestAspect(angle: number, orbs: Orbs): { type: AspectType; orb: number } | null {
  let best: { type: AspectType; orb: number } | null = null;
  for (const [type, perfect] of Object.entries(PERFECT_ANGLES) as [AspectType, number][]) {
    const orb = Math.abs(angle - perfect);
    if (orb <= orbs[type] && (best === null || orb < best.orb)) {
      best = { type, orb };
    }
  }
  return best;
}
