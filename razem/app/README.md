# Razem — PWA

Mobile web app (installable PWA) for Polish tourists in Rome, built from the Claude Design prototype `project/Razem App.dc.html` (screen 1a).

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve dist/ (service worker active)
```

## Publish

`dist/` is a static site; any HTTPS static host works (a service worker, GPS and camera all require HTTPS).

- **Netlify**: connect the repo with base directory `razem/app/` (build settings are in `netlify.toml`), or drag `dist/` into the Netlify dashboard.
- **Vercel**: import the repo with root directory `razem/app/` (`vercel.json` is included).

On the phone: open the URL, then **Share → Add to Home Screen** (iOS Safari) or **Install app** (Android Chrome). It opens full-screen, like a native app.

## Two versions, one build

`public/config.js` decides which version runs:

- **Empty (stand-alone):** no server. The agency creates signed links on `/agenzia` (see *Access*). Trip data is the design's demo trip and the chat replies are simulated.
- **With Supabase URL + anon key (backend):** the agency logs in on `/agenzia`. For each booking it enters flight, hotel, transfer, contacts and the day-by-day programme, and gets a code, link and QR. The traveller sees their real data. The chat with the assistant is real. Access limits are enforced by the server: max 6 phones per code, expiry date, instant blocking, and disconnecting a phone.

You can edit `config.js` directly in the published folder; no rebuild is needed.

## Backend (Supabase, free plan)

1. Create a project at supabase.com (EU region, e.g. Frankfurt).
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. In the same editor, run `select razem_create_agency('Agency name', 'office@agency.pl', 'a-long-password');`
4. Project Settings → API: copy the **Project URL** and the **anon public** key into `config.js`.
5. Republish, then log in at `/agenzia` with that e-mail and password.

How it works: every table is closed to the public (RLS on, no policies). The app and the panel only call the `agency_*` / `trip_*` SQL functions, which check an agency session token or a traveller device token. Travellers pick up new messages every 4 s while the chat is open (every 16 s otherwise), and re-check their access every minute and whenever the app is reopened. A blocked, expired or disconnected phone returns to the code screen. Messages written offline are kept on the phone and sent when it reconnects; if the assistant has a phone number, the SMS app also opens.

Local development without Supabase: `node scripts/dev-backend.mjs` runs the same SQL in an in-process Postgres (PGlite) with the same HTTP API on :54321 (agency `demo@razem.test` / `demo-password-123`). `scripts/e2e-backend.mjs` is the end-to-end test (21 checks).

## Access (trip codes)

**Normal flow, no rebuild needed.** The agency opens `/agenzia` on the published site, enters the agency password, sets the return date (access is valid until 30 days after it by default) and gets a personal link + QR code. It can send them by WhatsApp or email, with a ready-made message in Polish. The traveller opens the link and the app unlocks. Each link is digitally signed (ECDSA P-256): the app checks it offline with the public key, and it can't be forged or have its date changed.

- Change the agency password (the same links keep working): `node scripts/setup-keys.mjs "<new>" --rekey-from "<old>"`, then rebuild.
- New keys (**all issued links stop working**): `node scripts/setup-keys.mjs "<password>"`, then rebuild.
- Block a link before it expires: add its label (e.g. `RZM-ZYV334`) to `"revoked"` in `src/access-codes.json`, then rebuild.

**Fixed codes (optional).**

The app opens only with a valid trip code from the agency. Each code has an expiry date. The code is checked when it's entered and again at every launch, so an expired or removed code loses access. The "Use demo code" button is hidden.

```bash
node scripts/add-code.mjs new 2026-11-15 "Agency name" "Nowak family"   # generates e.g. RZM-7KQ2-XM4P
node scripts/add-code.mjs RZM-1234 2026-11-15 "Agency name"             # adds a specific code
# then: npm run build, and republish dist/
```

Codes are stored in `src/access-codes.json` as SHA-256 hashes only; the plain codes never ship in the app. To remove a code, delete its entry and rebuild. `RZM-2481` (valid to 31.12.2026) is a demo code: remove it before launch.

**Limits:** this check runs in the browser, so it keeps out anyone without a code, but a technical user could get around it. It also can't limit devices per code or revoke a code instantly. For those rules (for example max 6 devices, and valid until 30 days after the return), connect the check to the agency's booking backend. Prefer long codes (`new` generates `RZM-XXXX-XXXX`): short 4-digit codes are easy to guess.

## Structure

| File | Contents |
|---|---|
| `src/data.js` | All strings (PL/IT/EN) and data, copied unchanged from the prototype's logic block. Use it as the source for i18n files. |
| `src/App.jsx` | App state and behaviour, ported from the prototype's `Component` class, plus PWA features. |
| `src/View.jsx` | The UI, converted from the prototype template by `scripts/convert.mjs`, then adapted to full screen. |
| `src/MapView.jsx` | The Leaflet map from `map.html`: position, hotel, POIs, crowd layer and route. |
| `src/access.js`, `src/access-codes.json` | Trip-code access check and the list of valid codes. |
| `src/api.js`, `src/trip.js` | Backend client (Supabase RPC) and booking → screen values. |
| `src/agency.jsx`, `src/agencyPanel.jsx` | Agency page: signed links (stand-alone) or the bookings panel (backend). |
| `supabase/schema.sql` | Database, security and API functions. |
| `src/storage.js` | Saved app state (localStorage) and the encrypted document vault (IndexedDB + AES-GCM). |

## Real vs. simulated

**Works for real in this build**
- Installable, full-screen, safe-area aware (notch / home bar).
- Offline: the app shell and fonts are pre-cached. Map tiles and photos are cached as they're viewed. Offline mode follows the real network state.
- Map: live GPS position when location sharing is on and you are in Rome; otherwise the demo position (Trevi). "Turn-by-turn navigation" opens Google Maps walking directions.
- Document vault: camera photos are downscaled, encrypted with a non-extractable device key and kept only on the phone.
- Anti-theft alarm (motion mode): the accelerometer triggers the siren (iOS asks for permission when you arm it).
- State persists across restarts: language, onboarding, tickets, bookings, chat and consents.
- Privacy: "Download my data" exports JSON, and "Delete account" (tap twice) wipes everything on the device.
- 112 is a real `tel:` link.

**Still simulated** (see the design README → *Integrations needed*)
- Weather, strikes, crowd levels, tour availability, payments (Apple Pay / Google Pay), Wallet passes and QR codes.
- Tour booking requests go to the real chat, but the assistant confirms them by writing back; there is no automatic voucher yet.
- Video calls: with a phone number the button opens WhatsApp; otherwise it shows the simulated call screen. Normal calls use the real number when the agency has entered one.
- Face ID, the watch/Bluetooth alarm, group geofencing and push notifications (the chat uses polling).
- The assistant's name inside the fixed texts is "Marta"; name, initials and phone on cards and in the chat come from the booking.
- Photos come from Wikimedia Commons; the production app needs licensed photos or credits.
