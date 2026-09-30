# Handoff: Razem — app for Polish tourists in Italy

## Overview
Razem ("together" in Polish) is a mobile app for **iOS and Android** for Polish tourists in Italian cities (Rome first; Florence, Milan and Venice later). A Polish travel agency includes it in the travel package. The tourist signs in with a **trip code** and finds the flight, hotel, transfer, programme and tickets already in the app. A **human assistant/guide** who speaks Polish and lives in the city handles every problem through chat, phone or video. The app doesn't sell flights.

The product has 3 parts:
1. **Tourist app** (iOS + Android): designed in `Razem App.dc.html`, prototype 1a.
2. **Staff app** for guides/assistants: the same app in "Staff" mode, unlocked with a guide code. It receives chats, calls, requests, SOS and alarms. *Not designed yet.*
3. **Agency web panel**: bookings, codes, guides, programmes, welcome message. *Not designed yet*; described in `Razem Guida Agenzia.dc.html`.

## About the design files
The files in this package are **HTML design references**: prototypes that show the intended look and behaviour. They are not production code to copy. The job is to **rebuild them in the target environment**. Recommended: **React Native (Expo) or Flutter**, one codebase for iOS + Android, plus native maps (Apple Maps / Google Maps).

## Fidelity
**High-fidelity** for the tourist app (1a): final colours, typography, spacing, copy and interactions. Screens 1b and 1c are alternative home directions (static) and are not required.
Data (prices, availability, weather, strikes, crowding, the QR code) is **simulated** and must come from real services.

## Languages
The whole UI is in **PL (default), IT, EN**. The switch is on the home screen, in onboarding and in the guide. All strings are in the `T`, `T2`…`T9` objects in the logic class of `Razem App.dc.html`: use them as the source for i18n files (`pl.json`, `it.json`, `en.json`).

## Screens (tourist app)
Design frame 390×844 (iPhone). Bottom tab bar 84px with 5 tabs: **Dziś (Today) · Mapa (Map) · Odkrywaj (Explore) · Pomoc (Help) · Czat (Chat)**.

1. **Onboarding (4 steps)**
   - Welcome with a photo.
   - Trip code (`RZM-0000`), which loads flight, airport, hotel and agency.
   - Privacy / GDPR: location sharing (During trip / SOS only / Off) and required consent.
   - Meet your assistant (Marta).
2. **City welcome**: full-screen photo, "Witaj w Rzymie!" (Welcome to Rome!), agency thank-you card (logo + message editable from the panel).
3. **Home / Today**, top to bottom:
   - wordmark + city (sheet with Rome active and other cities "soon"), PL/IT/EN switch, **?** button;
   - greeting, location status, round red **SOS** button;
   - 5-day weather;
   - offline banner (when there's no network);
   - safety card ("phone and wallet in front");
   - strike card with plan B;
   - next step (transfer, 4-segment progress bar);
   - "Crowds now" list with levels and best times;
   - "My tickets" (counter);
   - assistant card (Message / Call / Video);
   - 12-tile grid with 3-letter codes (TRF HTL BUS MAP TUR MUZ VAT DOC TIP ABC PRV ALR);
   - "Discover Rome" photo carousel;
   - day plan.
4. **Airport transfer**: 4-stage timeline (landed → baggage → driver → to hotel), name sign "RAZEM · A. NOWAK", driver card (photo, car, plate), meeting point, call driver / message Marta.
5. **Map**: user position always visible (blue dot, accuracy radius). Crowd layer (red/amber/green circles, toggle). "Back to hotel" button draws a walking route with step-by-step directions. "Taxi: show address", "I'm lost → Marta" (sends position). Push notification when near crowded areas.
6. **Explore**: filters (All / Tours / Museums / Vatican), cards with photo, duration, Polish guide, price, **availability**.
7. **Tour detail**:
   - dates with availability dot;
   - times with seats left (sold out = struck through and disabled);
   - people stepper;
   - live availability line;
   - **Buy with phone** (entry ticket only, Apple/Google Pay);
   - **Send request** (guided tour, assistant confirms within 15 min): pending → confirmed, voucher added to tickets automatically.
8. **My tickets**: ticket list (badge AGENCY / BOUGHT). Tapping one expands the QR code and "Add to Apple / Google Wallet".
9. **Transport**: strike box, contactless info, buy BIT / 24H / 48H / 72H with the phone, main lines (Metro A/B, bus 40, FL1), pickpocket warning.
10. **Hotel**: address in Italian to show the taxi driver, check-in/out, info, "Problem with the hotel".
11. **Help**: 6 categories + description, "Connect with Marta", call/video, SOS.
12. **Chat**: bubbles, typing indicator, call/video in the header. Offline, messages go by SMS.
13. **SOS**: red background. 112, assistant 24/7, stolen documents → vault, alarm and group, Polish Embassy (Via Pietro Paolo Rubens 20), share location.
14. **Document vault**: Face ID lock, photos of passport/ID/EHIC/insurance (camera), 24h sharing with the assistant, 3-step theft procedure.
15. **Protection (ALR)**:
    - anti-theft alarm, "Phone motion" or "Distance from watch" mode (5/10/20 m), loud siren + flashing screen, turned off with Face ID;
    - group alert (50/100/200 m), members list;
    - separation overlay: call guide / show on map / all OK.
16. **Privacy**: location, toggles (auto-deletion after 30 days, agency data), export data, data protection officer, delete account.
17. **Tips**, **Phrases** (PL → IT + pronunciation, tap to enlarge), **My trip** (agency programme, group leader, 5 days).
18. **Guide (?)**: sheet with language, feature list (tap to open) and "Show me where to tap". Coach-mark tour in 7 steps: highlight with dark mask, pulsing yellow dot, 01/07 tooltip.
19. **Call overlay**: dark background, pulsing avatar, "Connecting…" then "Connected".

## Interactions and behaviour
- Navigation: tabs reset the history. Sub-screens have ← back and ? in the header.
- Transitions: coach mark 0.3s ease; pulse keyframe 1.4–1.6s; alarm flash 0.5s steps(1).
- Booking request: pending (amber) → confirmed (green) after the assistant replies; a chat message and a voucher are created.
- Buying: payment sheet → 1.1s "Paying…" → ticket added + green toast "Added to My tickets".
- Availability: if seats < people, both purchase buttons are disabled (opacity 0.4) with an explanatory message.
- Offline: tap 5G in the demo to toggle. Map/SOS/documents/alarm/tickets/phrases keep working; chat goes by SMS; bookings and video are disabled.
- Map push: the first time Map opens, after 1.5s, closes on its own after 8s.

## Message routing (backend)
Chat, calls, requests, SOS and alarms go to the **assigned guide**. If there's no answer they go to the backup guide (calls after 30s), then to the agency. SOS reaches everyone at once. Calls go through a VoIP/masked number, so the guide's personal number stays private. Details are in the agency guide, chapter 4.

## Codes
- `AG-0000`: agency (web panel).
- `GD-CITY-000`: personal guide code (Staff mode, one device at a time, can be blocked).
- `RZM-0000`: trip (up to 6 devices, valid until 30 days after return, can be resent by SMS).

## State (main)
`lang, screen, history, onb, code, tripLoaded, rodo, locMode, stage (transfer 0–4), filter, tourId, bDate, bTime, people, bStatus{}, tickets[], openTicket, pay, msgs[], typing, calling, vault, docs{}, shareDocs, armed, alarmMode, alarmDist, alarmOn, groupAlert, groupRadius, groupOn, routeOn, crowdOff, offline, guide, tour, strikeHidden, safetyHidden`.

## Integrations needed
Push notifications · geolocation + geofencing (crowds, group) · native maps + offline maps · Bluetooth LE (watch/tag for the distance alarm) · accelerometer (motion alarm) · Face ID / biometrics · on-device encrypted storage (vault) · Apple Pay / Google Pay · Apple/Google Wallet passes · VoIP calls/video · SMS fallback · weather API · strike feed (Italian Ministry of Transport) · ATAC tickets · museum/Vatican ticketing (authorised reseller) · crowd data.

## Design tokens
**Colours**
- ink `#16181D`
- paper `#F4F1EA`
- card `#FFFFFF`
- accent red (Poland) `#C8102E`, hover `#A70D26`
- ochre (Rome) `#F2B33D`
- green `#1F8A5B` / `#3DBE7A`, light green bg `#E4F4EB`
- light amber bg `#FFF6DF`, light red bg `#FDECEF`
- map blue `#1C5FB8`
- text muted `#5E6068`, secondary `#4A4C54`, `#33353C`
- neutral `#E4DFD4` / `#CFC9BC` / `#B9B2A3`
- lines `rgba(22,24,29,.07–.15)`

**Typography**
- **Onest** (400–800) for UI; **JetBrains Mono** (500/700) for codes, times, labels.
- H1 30–34/800/-0.03em
- card title 16–23/700–800
- body 13–15/1.4–1.5
- mono label 10–11/700/+0.08em uppercase

**Radius**: pills 999 · cards 20–24 · buttons 12–16 · tiles 18 · sheets 28 on top.
**Shadows**: `0 8px 18px -6px rgba(200,16,46,.6)` on SOS · sheets/push `0 12px 30px rgba(0,0,0,.28)`.
**Targets**: minimum 44px.

## Assets
- City photos: Wikimedia Commons (free licences, loaded via `Special:FilePath`; list in `IMGS`, `inspo`, `cityCards`). For production: licensed photos, with credits.
- Map: OpenStreetMap/Leaflet in the prototype only; use native maps.
- Placeholders to replace: agency logo, photos of the assistant and driver.
- Icons: none. The design uses 3-letter mono codes in tiles (a deliberate "transport signage" style).

## Files
- `Razem App.dc.html`: full prototype (1a) + alternatives 1b/1c + notes. Logic class = data, strings and behaviour.
- `map.html`: map (position, hotel, POIs, crowd layer, route; postMessage messages `route`, `crowd`, `recenter`).
- `Razem Guida Agenzia.dc.html`: operations guide for agencies + code guide (A4 PDF).
- `doc-page.js`, `support.js`: prototype runtime only, not needed in production.
