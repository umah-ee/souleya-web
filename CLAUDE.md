# souleya-web – Next.js Web-App

**Framework:** Next.js 16 App Router · **Port:** 3001 (`next dev`) · **Production:** souleya.com (Vercel, Mono-Domain)

---

## Starten

```bash
cd Dev/souleya-web
next dev          # Port 3001
next build        # Production Build
```

## Env (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://qxrjauhayppumggwobmi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_t10h88yMAHQ4rmQivLR9xg_2GYnb5HP
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox_public_token>
```

---

## Kernabhängigkeiten

- **Next.js 16** + React 19 + TypeScript 5
- **Supabase JS** – Auth SSR Client (`lib/supabase/`)
- **TanStack React Query 5** – Server State
- **Zustand** – Client State (Auth, Theme)
- **Mapbox GL** – Karte im Discover-Bereich
- **Tailwind CSS 3.4**

---

## App-Struktur (`src/`)

```
app/
├── (public)/            # Oeffentliche Seiten (kein Auth noetig)
│   ├── page.tsx         # Homepage (Hero, Features, First Light, FAQ)
│   ├── preise/          # Preisseite (20 €/Monat, 200 €/Jahr)
│   ├── ueber-uns/       # Ueber-uns mit Team-Fotos + Lightbox
│   ├── blog/            # Blog
│   ├── impressum/       # Impressum
│   ├── datenschutz/     # Datenschutz
│   └── agb/             # AGB
├── (main)/              # Authed-Bereich mit Sidebar-Layout
│   ├── pulse/           # Feed (Timeline, CreatePulseForm)
│   ├── discover/        # Mapbox-Karte, Events, Places, Nutzer
│   ├── circles/         # Freundesnetzwerk, Anfragen, Feed
│   ├── chat/            # Channels, ChatRoom (Realtime)
│   └── profile/         # Eigenes Profil + Bearbeitung
├── u/[username]/        # Öffentliches Profil
├── auth/                # Supabase Auth Callback
├── login/               # Magic Link OTP
├── studio/              # Platzhalter ("Bald verfügbar")
└── layout.tsx

components/
├── auth/                # LoginForm
├── pulse/               # PulseCard, CreatePulseForm
├── discover/            # MapView, EventCard, PlaceCard, PlaceDetailModal,
│                          CreateEventModal, CreatePlaceModal, ProfileModal
├── chat/                # ChannelList, ChatRoom, MessageBubble, Reactions,
│                          Polls, SeedsTransfer, GroupInfoPanel
├── circles/             # ConnectionCard, RequestList, CirclesFeed
├── layout/              # Sidebar (Desktop), BottomTabs (Mobile), UnreadBadge
├── shared/              # Avatar, Badge, EnsoRing, ThemeToggle, ...
└── ui/                  # Base Components (Button, Input, Card, Modal)

lib/
├── api.ts               # REST API Client (JWT Bearer → souleya-api)
├── supabase/            # SSR + Browser Client
└── pulse|chat|places|events|circles|users|profile.ts
```

---

## Implementierungsstatus

| Bereich | Status | Anmerkung |
|---|---|---|
| Auth (Magic Link OTP) | ✅ | SSR, Auth Callback, AuthGuard |
| Pulse Feed | ✅ | CRUD, Like, Kommentare, Bilder, Polls |
| Discover | ✅ | Mapbox-Karte, Events, Places, User-Suche, Geo |
| Circles | ✅ | Verbindungen, Anfragen, Feed |
| Chat | ✅ | Realtime, Polls, Seeds-Transfer, Bilder, Gruppen |
| Profil | ✅ | Avatar, Banner, GPS, Interest-Tags, Badges |
| Öffentliches Profil `/u/:username` | ✅ | |
| Theme (Light/Dark) | ✅ | `data-theme` Attribut, ThemeProvider |
| Oeffentliche Seiten (Homepage, Preise, Ueber uns, Blog) | ✅ | Mono-Domain souleya.com |
| Studio | ⏳ | Nur UI-Platzhalter |
| Analytics | ⏳ | Nur UI-Platzhalter |

---

## Mono-Domain: souleya.com

Seit Maerz 2026 laeuft **alles** ueber `souleya.com`:
- Oeffentliche Seiten: `/`, `/preise`, `/ueber-uns`, `/blog`, `/impressum`, `/datenschutz`, `/agb`
- Auth: `/login`, `/auth/`
- App: `/pulse`, `/discover`, `/circles`, `/chat`, `/profile`

`circle.souleya.com` wurde entfernt. Die alte Landing Page (`Dev/landing/`) dient nur noch als Design-Referenz.

---

## Wichtig: Next.js 16 nutzt `proxy.ts`, KEINE `middleware.ts`!

Next.js 16 hat `middleware.ts` durch `proxy.ts` ersetzt. **NIEMALS eine `middleware.ts` erstellen** – das verursacht einen Build-Fehler auf Vercel. Alle Route-Guards, Auth-Checks und Pre-Launch-Logik gehören in `src/proxy.ts`.

---

## Auth-Flow

**Registrierung + Login (alles auf souleya.com):**
```
souleya.com: E-Mail eingeben → signInWithOtp()
→ OTP-Code per E-Mail (8-stellig)
→ User gibt Code ein
→ verifyOtp() → Session-Cookies gesetzt → /profile bzw. (main)/...
```

> **Hinweis:** Seit der Mono-Domain-Migration laeuft alles ueber souleya.com. Es gibt kein circle.souleya.com mehr.

**Supabase OTP-Codes sind 8-stellig** (nicht 6).

API-Calls: JWT Bearer Token aus Supabase Session → `lib/api.ts`

---

## Design-System

Tokens aus `app/globals.css` – alles über `var(--token)`, keine Hardcoded-Farben.
**Referenz:** `Strategy/Souleya_StyleGuide_Complete.html` (v2.1)

---

## Tonalitaet (verbindlich fuer alle UI-Texte)

Souleya spricht **frisch, locker und liebevoll**. Kein Corporate-Deutsch, keine steifen Floskeln.

- **Duzen** – immer
- **Positiv formulieren** – statt „Fehler aufgetreten" → „Das hat leider nicht geklappt."
- **Empathisch bei Fehlern** – „Kein Problem", „Versuch es gerne nochmal."
- **Ellipsen** – „Einen Moment …" (echtes Auslassungszeichen, nicht „...")
- **Kein Tech-Jargon** – „Sitzung" statt „Session", „Postfach" statt „Inbox"
- **Keine Ausrufezeichen-Inflation**

**Beispiele:**
| Alt | Neu |
|---|---|
| Fehler beim Setzen des Passworts. | Das hat leider nicht geklappt. Versuch es gerne nochmal. |
| Session abgelaufen. Bitte erneut anmelden. | Deine Sitzung ist abgelaufen. Melde dich einfach nochmal an. |
| Ungültiger Code. Bitte versuche es erneut. | Der Code war leider nicht richtig. Probier es nochmal. |

---

## Mitgliedschaft & Preise

| Modell | Preis | Details |
|---|---|---|
| Monatlich | 20 € / Monat | Monatlich kuendbar, keine Mindestlaufzeit |
| Jaehrlich | 200 € / Jahr | 2 Monate gratis, Sabbatical-Modus (bis 2 Monate pausieren) |

Keine kostenfreie Variante. Premium-Inhalte (Mentor-Sessions, Kurse) ueber Seeds oder Einzelkauf.

---

*Zuletzt aktualisiert: Maerz 2026*
