import { json, method, body } from "./_lib/http.mjs";
import { store } from "./_lib/store.mjs";
import { requireOwner } from "./_lib/auth.mjs";

const KEY = "bookings";

async function readBookings() {
  const value = await store().get(KEY, { type: "json" });
  return Array.isArray(value) ? value : [];
}

function activeBookings(items) {
  const now = Date.now();
  return items.filter(item => Number(item?.expiresAt) > now);
}

export async function handler(event) {
  try {
    const m = method(event);
    if (m === "GET") {
      if (!requireOwner(event)) return json({ error: "Unauthorized" }, 401);
      const cleaned = activeBookings(await readBookings());
      await store().setJSON(KEY, cleaned);
      return json({ bookings: cleaned });
    }

    if (m === "POST") {
      const booking = body(event);
      if (!booking || typeof booking !== "object" || !booking.id || !booking.bookingDate) {
        return json({ error: "Invalid booking." }, 400);
      }
      const bookings = activeBookings(await readBookings());
      bookings.push(booking);
      await store().setJSON(KEY, bookings);
      return json({ ok: true });
    }

    if (m === "DELETE") {
      if (!requireOwner(event)) return json({ error: "Unauthorized" }, 401);
      const id = event.queryStringParameters?.id;
      if (!id) return json({ error: "Booking id is required." }, 400);
      const bookings = (await readBookings()).filter(item => item.id !== id);
      await store().setJSON(KEY, bookings);
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Server error." }, 500);
  }
}
