import { json, method, body } from "./_lib/http.mjs";
import { createSession, setCookie, verifyPassword } from "./_lib/auth.mjs";

export async function handler(event) {
  try {
    if (method(event) !== "POST") return json({ error: "Method not allowed" }, 405);
    const { password } = body(event);
    if (!(await verifyPassword(password))) return json({ error: "Incorrect password." }, 401);
    return json({ ok: true }, 200, { "Set-Cookie": setCookie(createSession()) });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Server error." }, 500);
  }
}
