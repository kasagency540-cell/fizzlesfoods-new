import { json, method, body } from "./_lib/http.mjs";
import { store, STATE_KEY } from "./_lib/store.mjs";
import { requireOwner } from "./_lib/auth.mjs";

const DEFAULT_STATE = {
  foods: [
    { id: "food-1", name: "Food Item 1", category: "Local dishes", price: "Contact us", description: "Add your food and price from the Owner panel." },
    { id: "food-2", name: "Food Item 2", category: "Local dishes", price: "Contact us", description: "Replace this with another food item." },
    { id: "food-3", name: "Food Item 3", category: "Local dishes", price: "Contact us", description: "Replace this with another food item." }
  ],
  events: [
    { id: "event-1", name: "Event Package 1", duration: "Contact us", price: "Contact us", description: "Add your event package from the Owner panel." },
    { id: "event-2", name: "Event Package 2", duration: "Contact us", price: "Contact us", description: "Add another event package." },
    { id: "event-3", name: "Event Package 3", duration: "Contact us", price: "Contact us", description: "Add another event package." }
  ],
  gallery1: [],
  gallery2: [],
  galleryTitles: { 1: "Gallery Box", 2: "Gallery Box" }
};

const ALLOWED_KEYS = new Set(["foods", "events", "gallery1", "gallery2", "galleryTitles"]);

async function readState() {
  const saved = await store().get(STATE_KEY, { type: "json" });
  if (!saved) {
    await store().setJSON(STATE_KEY, DEFAULT_STATE, { onlyIfNew: true });
    return (await store().get(STATE_KEY, { type: "json" })) || DEFAULT_STATE;
  }
  return { ...DEFAULT_STATE, ...saved };
}

export async function handler(event) {
  try {
    if (method(event) === "GET") {
      return json({ state: await readState() });
    }

    if (method(event) !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!requireOwner(event)) return json({ error: "Unauthorized" }, 401);

    const { key, value } = body(event);
    if (!ALLOWED_KEYS.has(key)) return json({ error: "Invalid state key." }, 400);

    if (key === "foods" && !Array.isArray(value)) return json({ error: "foods must be an array." }, 400);
    if (key === "events" && !Array.isArray(value)) return json({ error: "events must be an array." }, 400);
    if ((key === "gallery1" || key === "gallery2") && !Array.isArray(value)) return json({ error: `${key} must be an array.` }, 400);
    if (key === "galleryTitles" && (!value || typeof value !== "object")) return json({ error: "galleryTitles must be an object." }, 400);

    const current = await readState();
    current[key] = value;
    await store().setJSON(STATE_KEY, current);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Server error." }, 500);
  }
}
