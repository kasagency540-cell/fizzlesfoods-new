import { getStore } from "@netlify/blobs";

export const STORE_NAME = "fizzlesfoods-site";
export const STATE_KEY = "state";
export const PASSWORD_KEY = "owner-password";

export function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}
