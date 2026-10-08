import crypto from "node:crypto";
import { store, PASSWORD_KEY } from "./store.mjs";
import { cookie } from "./http.mjs";

const SESSION_COOKIE = "fz_owner_session";
const SESSION_MAX_AGE = 86400;

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function sign(value) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured.");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function makeToken() {
  const payload = `${Date.now()}:${crypto.randomBytes(24).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

function validToken(token) {
  if (!token) return false;
  const parts = String(token).split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const timestamp = Number(payload.split(":")[0]);
  return Number.isFinite(timestamp) && Date.now() - timestamp < SESSION_MAX_AGE * 1000;
}

export function setCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function requireOwner(event) {
  return validToken(cookie(event, SESSION_COOKIE));
}

export async function verifyPassword(password) {
  if (typeof password !== "string" || !password) return false;
  const siteStore = store();
  let stored = await siteStore.get(PASSWORD_KEY);

  if (!stored) {
    const initial = process.env.OWNER_INITIAL_PASSWORD;
    if (typeof initial !== "string" || !initial) {
      throw new Error("OWNER_INITIAL_PASSWORD is not configured.");
    }
    stored = hashPassword(initial);
    await siteStore.set(PASSWORD_KEY, stored, { onlyIfNew: true });
    stored = await siteStore.get(PASSWORD_KEY);
  }

  const supplied = hashPassword(password);
  if (typeof stored !== "string" || stored.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(stored, "hex"), Buffer.from(supplied, "hex"));
}

export async function savePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }
  await store().set(PASSWORD_KEY, hashPassword(password));
}

export function createSession() {
  return makeToken();
}
