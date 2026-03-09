# souleya-web – Next.js Web-App

**Framework:** Next.js 16 App Router · **Port:** 3001 (`next dev`) · **Production:** circle.souleya.com (Vercel)

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
| Studio | ⏳ | Nur UI-Platzhalter |
| Analytics | ⏳ | Nur UI-Platzhalter |

---

## Auth-Flow

```
Login → supabase.auth.signInWithOtp() → Magic Link E-Mail
→ /auth/callback → session.user → AuthGuard → (main)/...
```

API-Calls: JWT Bearer Token aus Supabase Session → `lib/api.ts`

---

## Design-System

Tokens aus `app/globals.css` – alles über `var(--token)`, keine Hardcoded-Farben.
**Referenz:** `Strategy/Souleya_StyleGuide_Complete.html` (v2.1)

---

*Zuletzt aktualisiert: März 2026*
