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
- **emoji-mart** – Vollstaendiger Emoji Picker

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
│                          CreateEventModal, CreatePlaceModal, ProfileModal,
│                          EventReviewCard, EventReviewForm, NominationCard
├── onboarding/          # OnboardingWizard (Soul 1→2/3, Fullscreen-Overlay, Inline-Steps: Avatar/Bio/Interests/Location/Birthday)
│   └── steps/           # StepAvatar, StepBio, StepInterests, StepLocation, StepBirthday
├── profile/             # SoulProgressCard, LevelUpModal
├── chat/                # ChannelList, ChatRoom, MessageBubble, Reactions,
│                          Polls, SeedsTransfer, GroupInfoPanel, EmojiPicker,
│                          MessageSearch, ForwardMessageModal, LinkPreviewCard,
│                          VoicePlayer, PinnedMessagesBar
├── circles/             # ConnectionCard, RequestList, CirclesFeed
├── layout/              # Sidebar (Desktop), BottomTabs (Mobile), UserMenu, UnreadBadge
├── notifications/       # NotificationContext, NotificationBell (Dropdown-Panel)
├── public/              # HeroSlider, WaitlistForm, FirstLightProgressBar,
│                          FirstLightSection, FeaturesGrid, HowItWorks, CtaFinal, ...
├── shared/              # Avatar, Badge, EnsoRing, ThemeToggle, PhotoCredit, ...
└── ui/                  # Base Components (Button, Input, Card, Modal)

hooks/
├── useCurrentProfile.ts # Aktuelles Profil (avatar, soul_level, is_first_light)
└── useVoiceRecorder.ts  # MediaRecorder Hook fuer Sprachnachrichten

lib/
├── api.ts               # REST API Client (JWT Bearer → souleya-api)
├── unsplash-credits.ts  # Zentrales Mapping Unsplash Photo-ID → Fotografen-Info
├── demo-covers.ts       # Demo-/Testbilder fuer Events (DemoCover mit Credit)
├── notifications.ts     # Notifications API (CRUD, unread-count)
├── progression.ts       # Soul Level Progression API (status, history, onboarding, event reviews)
├── nominations.ts       # Mentor-Voting API (active nominations, vote)
├── supabase/            # SSR + Browser Client
└── pulse|chat|places|events|circles|users|profile.ts
```

---

## Implementierungsstatus

| Bereich | Status | Anmerkung |
|---|---|---|
| Auth (Magic Link OTP + Passwort) | ✅ | SSR, Auth Callback, AuthGuard, kein Demo-Login mehr |
| Pulse Feed | ✅ | CRUD, Like, Kommentare, Bilder, Polls, Visibility-Chip (UI ready, API pending) |
| Discover | ✅ | Mapbox-Karte, Events, Places, User-Suche, Geo |
| Circles | ✅ | Verbindungen, Anfragen, Feed (nur verbundene User via `/circles/feed`) |
| Chat | ✅ | Realtime, Polls, Seeds-Transfer, Bilder, Gruppen, Markdown, Emoji-Picker, Tipp-Indikator, Lesebestaetigungen, Mute, Suche, Pin, Forward, Link-Preview, Sprachnachrichten |
| Profil | ✅ | Avatar, Banner (300px, Crop-Modal), GPS, Interest-Tags, Badges, EnsoRing v3 (Mockup-konform) |
| Öffentliches Profil `/u/:username` | ✅ | |
| Theme (Light/Dark) | ✅ | `data-theme` Attribut, ThemeProvider |
| Oeffentliche Seiten (Homepage, Preise, Ueber uns, Blog) | ✅ | Mono-Domain souleya.com |
| First Light Fortschrittsbalken | ✅ | Zweizonen-Balken (Early 1–200 + First Light 201–500), Enso-Marker, Shimmer, Realtime-Count, dynamisches Messaging |
| ImageGrid + Lightbox | ✅ | Global LightboxProvider (Context + Portal), z-200, Keyboard-Support |
| Navigation | ✅ | Sidebar default ausgeklappt, Profil oben rechts (EnsoRing), Notification-Bell |
| Benachrichtigungen | ✅ | NotificationBell mit Dropdown-Panel (Actor-Avatar, Loeschen, Gelesene loeschen, Badge-Pulse-Animation, Settings-Link), Realtime + 30s Polling |
| Soul Level System | ✅ | OnboardingWizard (Soul 1→2/3, Fullscreen-Overlay, Inline-Steps: Avatar/Bio/Interests/Location/Birthday; Early 1–200 → Level 3), SoulProgressCard (ab Level 2), LevelUpModal (Konfetti), Event Reviews, Sichtbarkeits-Algorithmus (Events + Pulse), Mentor-Voting, Level-Badges im Feed |
| Studio | ⏳ | Nur UI-Platzhalter |
| Analytics | ⏳ | Nur UI-Platzhalter |

---

## Mono-Domain: souleya.com

Seit Maerz 2026 laeuft **alles** ueber `souleya.com`:
- Oeffentliche Seiten: `/`, `/preise`, `/ueber-uns`, `/blog`, `/impressum`, `/datenschutz`, `/agb`
- Auth: `/login`, `/auth/`
- App: `/pulse`, `/discover`, `/circles`, `/chat`, `/profile`

`circle.souleya.com` wurde komplett entfernt (nicht nur Redirect, sondern geloescht). Die alte Landing Page (`Dev/landing/`) dient nur noch als Design-Referenz.

---

## Pre-Launch Sperre

Gesteuert ueber `NEXT_PUBLIC_PRE_LAUNCH=true` in Vercel Environment Variables.

**Server-Seite (`proxy.ts`):**
- Erlaubte Routen fuer normale User: `/`, `/profile`, `/u/`, `/dashboard`
- Alle anderen Routen → Redirect auf `/profile`
- **Admins** (`is_admin`) und **Beta-Tester** (`is_beta_tester`) sind komplett ausgenommen

**Client-Seite (`(main)/layout.tsx`):**
- Visuelle Overlays (Blur + Banner "Souleya oeffnet im Sommer 2026") ueber Navigation
- **Admins** und **Beta-Tester** sehen keine Overlays

**Datenbank:**
- `profiles.is_admin` (Boolean) — gesetzt ueber Migration 032
- `profiles.is_beta_tester` (Boolean) — gesetzt ueber Migration 047
- Beide Flags muessen in der DB manuell gesetzt werden (Supabase Dashboard oder SQL)

---

## Wichtig: Next.js 16 nutzt `proxy.ts`, KEINE `middleware.ts`!

Next.js 16 hat `middleware.ts` durch `proxy.ts` ersetzt. **NIEMALS eine `middleware.ts` erstellen** – das verursacht einen Build-Fehler auf Vercel. Alle Route-Guards, Auth-Checks und Pre-Launch-Logik gehören in `src/proxy.ts`.

---

## Auth-Flow

**Zwei Login-Modi** (Toggle auf Login-Seite):
1. **Passwort-Login** (Default): E-Mail + Passwort → `signInWithPassword()`
2. **OTP-Login**: E-Mail → `signInWithOtp()` → 8-stelliger Code per E-Mail → `verifyOtp()`

Passwort-vergessen-Funktion ueber `resetPasswordForEmail()`.

> **Demo-Login wurde entfernt** (Maerz 2026). Keine Demo-Accounts mehr im System.

**Supabase OTP-Codes sind 8-stellig** (nicht 6).

API-Calls: JWT Bearer Token aus Supabase Session → `lib/api.ts`

---

## Design-System

Tokens aus `app/globals.css` – alles über `var(--token)`, keine Hardcoded-Farben.
**Referenz:** `Strategy/Souleya_StyleGuide_Complete.html` (v2.1)

### Enso-Logo (Offizielle Spezifikation)

**Einzige autorisierte Quelle:** `Souleya/Mockups/Souleya_Logo_Final_Enso.html`

Das Enso-Logo darf **ausschliesslich** aus dieser Referenz-Datei reproduziert werden. Keine Eigeninterpretationen.

```html
<svg viewBox="0 0 100 100" width="SIZE" height="SIZE">
  <defs>
    <linearGradient id="enso-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A8894E"/>
      <stop offset="100%" stop-color="#D4BC8B"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="36" fill="none"
    stroke="url(#enso-grad)" stroke-width="8" stroke-linecap="round"
    stroke-dasharray="196 30" stroke-dashoffset="15"/>
</svg>
```

| Display-Groesse | stroke-width |
|---|---|
| ≤ 20px | `10` |
| 36px | `9` |
| 48px | `8` oder `9` |
| 56px+ | `8` |

Oeffnung **immer zwischen 1 und 2 Uhr**. Gradient `#A8894E` → `#D4BC8B`. Kein Fill. Strichstaerke/Proportionen/Oeffnung NICHT variieren.

### Enso-Ring im Profil (Offizielle Spezifikation)

**Einzige autorisierte Quelle:** `Souleya/Mockups/Souleya_EnsoRing_Levels.html`

Der Enso-Ring als Profil-Avatar-Rahmen (Soul Levels, First Light, Mentor-Kompassstern) darf **ausschliesslich** aus dieser Referenz-Datei reproduziert werden. Enthält: 5 Level-Stufen (`stroke-dasharray`), First Light-Lichtpunkt (`cx="82.8" cy="35.2"`), Mentor-Kompassstern (`cx="61.2" cy="15.8"`, nur Level 5), alle SVG-Parameter und Kombinationen. Keine Eigeninterpretationen.

### Unsplash-Attribution

Alle Unsplash-Bilder muessen korrekt attribuiert werden: **Fotografen-Name** (verlinkt auf Profil mit UTM) + **"auf Unsplash"** (verlinkt mit UTM).

- **`src/lib/unsplash-credits.ts`** — Zentrales Mapping von Unsplash Photo-ID → `{ name, username }`
- **`src/components/shared/PhotoCredit.tsx`** — Wiederverwendbare Attributions-Komponente
  - `hover` (default): Halbtransparentes Overlay am unteren Bildrand, sichtbar bei Hover. Container braucht `position: relative` und `class="group"`.
  - `inline`: Statischer Text unter dem Bild (z.B. Blog-Detail)
  - `mini`: Kamera-Icon mit Tooltip (z.B. kleine Avatare)
- **`src/lib/demo-covers.ts`** — `getEventCover()` und `getDemoCover()` geben `DemoCover { url, credit }` zurueck (nicht mehr nur `string`)
- UTM-Parameter: `?utm_source=souleya&utm_medium=referral`

**Wo verwendet:** HeroSlider, FeaturesGrid, HowItWorks, FirstLightSection, EventCardCompact, DiscoverOverlay, Blog-Liste, Blog-Detail. Events mit eigenem `cover_url` (kein Unsplash) bekommen keinen Credit.

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
