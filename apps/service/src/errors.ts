import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorCode = "invalid_input" | "infeasible" | "wasm_error" | "internal";

export type ErrorPayload = {
  error: { code: ErrorCode; message: string; details?: unknown };
};

export function httpStatusFor(code: ErrorCode): ContentfulStatusCode {
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
