# Fizzlesfoods — Netlify Blobs backend

This backend intentionally does not use Supabase.

## Netlify environment variables

Set these two variables privately in Netlify:

- OWNER_INITIAL_PASSWORD — the private password you want to use for the owner account.
- SESSION_SECRET — a long random secret used to sign owner sessions.

Do not put either value in index.html or commit them to GitHub.

## Storage

Netlify Blobs stores the shared site state and booking history. The state is available across devices and survives new deployments.
