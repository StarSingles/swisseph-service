import { Hono } from "hono";
import { loadSwissEph } from "./ephemeris/wasm-loader";
import { housesRoute } from "./routes/houses";
import { julianDayRoute } from "./routes/julian-day";
import { planetPositionRoute } from "./routes/planet-position";

type Env = {
  ENVIRONMENT: string;
  ASSETS?: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/api/v1/health", async (c) => {
  try {
    const eph = await loadSwissEph();
    return c.json({
      ok: true,
      wasmLoaded: true,
      swissephVersion: eph.version,
      environment: c.env.ENVIRONMENT,
    });
  } catch (err) {
    return c.json(
      {
        ok: false,
        wasmLoaded: false,
        swissephVersion: "unknown",
        environment: c.env.ENVIRONMENT,
        error: (err as Error).message,
      },
      500,
    );
  }
});

app.route("/api/v1/julian-day", julianDayRoute);
app.route("/api/v1/planet-position", planetPositionRoute);
app.route("/api/v1/houses", housesRoute);

// Fallback: anything not under /api/* is served by the static assets binding.
app.all("*", async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.text("Not Found", 404);
});

export default app;
