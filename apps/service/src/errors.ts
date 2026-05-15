import type { Context } from "hono";

export type ErrorCode = "invalid_input" | "infeasible" | "wasm_error" | "internal";

export type ErrorPayload = {
  error: { code: ErrorCode; message: string; details?: unknown };
};

export function httpStatusFor(code: ErrorCode): number {
  switch (code) {
    case "invalid_input":
      return 400;
    case "infeasible":
      return 422;
    case "wasm_error":
    case "internal":
      return 500;
  }
}

export function jsonError(c: Context, code: ErrorCode, message: string, details?: unknown) {
  const body: ErrorPayload = { error: { code, message, details } };
  return c.json(body, httpStatusFor(code));
}
