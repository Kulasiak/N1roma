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

## Structure

| File | Contents |
|---|---|
| `src/data.js` | All strings (PL/IT/EN) and data, copied unchanged from the prototype's logic block. Use it as the source for i18n files. |
| `src/App.jsx` | App state and behaviour, ported from the prototype's `Component` class, plus PWA features. |
| `src/View.jsx` | The UI, converted from the prototype template by `scripts/convert.mjs`, then adapted to full screen. |
| `src/MapView.jsx` | The Leaflet map from `map.html`: position, hotel, POIs, crowd layer and route. |
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

**Still simulated, needs a backend or integrations** (see the design README → *Integrations needed*)
- Trip code lookup, Marta's chat replies, calls and video (VoIP), booking confirmations.
- Payments (Apple Pay / Google Pay), Wallet passes, QR codes, availability, weather, strikes and crowd levels.
- Face ID unlock (a WebAuthn platform authenticator could replace it), watch/Bluetooth distance alarm, group geofencing, push notifications.
- Photos come from Wikimedia Commons; the production app needs licensed photos or credits.
