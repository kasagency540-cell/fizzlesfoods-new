import { json } from "./_lib/http.mjs";
import { requireOwner } from "./_lib/auth.mjs";

export async function handler(event) {
  return json({ authenticated: requireOwner(event) });
}
