import { json, method, body } from "./_lib/http.mjs";
import { requireOwner, verifyPassword, savePassword } from "./_lib/auth.mjs";

export async function handler(event) {
  try {
    if (method(event) !== "POST" || !requireOwner(event)) return json({ error: "Unauthorized" }, 401);
    const { currentPassword, newPassword } = body(event);
    if (!(await verifyPassword(currentPassword))) return json({ error: "Current password is incorrect." }, 400);
    await savePassword(newPassword);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Server error." }, 500);
  }
}
