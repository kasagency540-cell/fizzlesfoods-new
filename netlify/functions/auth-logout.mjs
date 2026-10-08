import { json, method } from "./_lib/http.mjs";
import { clearCookie } from "./_lib/auth.mjs";

export async function handler(event) {
  if (method(event) !== "POST") return json({ error: "Method not allowed" }, 405);
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}
