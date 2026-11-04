import { randomBytes } from "node:crypto";

/** URL-safe unguessable token for /r/[token] and /join/[token] links. */
export function randomToken(bytes = 18): string {
  return randomBytes(bytes).toString("base64url");
}
