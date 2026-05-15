import { Hono } from "hono";

type Env = {
  ENVIRONMENT: string;
  ASSETS?: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/api/v1/health", (c) =>
  c.json({
    ok: true,
    wasmLoaded: false, // toggled true in Task 11
    swissephVersion: "unknown",
    environment: c.env.ENVIRONMENT,
  }),
);

// Fallback: anything not under /api/* is served by the static assets binding.
app.all("*", async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.text("Not Found", 404);
});

export default app;
