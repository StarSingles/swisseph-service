import { Hono } from "hono";
import { computeBirthChart } from "../ephemeris/chart";
import { jsonError } from "../errors";
import { BirthData } from "../schemas/birth-data";

export const birthChartRoute = new Hono();

birthChartRoute.post("/", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = BirthData.safeParse(raw);
  if (!parsed.success) {
    return jsonError(c, "invalid_input", "Invalid birth data", parsed.error.flatten());
  }
  try {
    const chart = await computeBirthChart(parsed.data);
    return c.json(chart);
  } catch (err) {
    return jsonError(c, "wasm_error", (err as Error).message);
  }
});
