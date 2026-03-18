# Souleya UTM-Tracking Guide

## Was ist UTM?

UTM-Parameter sind Zusaetze an eine URL, die im Vercel Analytics Dashboard zeigen woher ein Besucher kam. Vercel erkennt sie automatisch — ihr muesst nur die richtigen URLs verwenden.

## Die 5 Parameter

| Parameter | Bedeutung | Pflicht? |
|---|---|---|
| `utm_source` | Woher? (instagram, google, newsletter) | Ja |
| `utm_medium` | Kanal-Typ (social, cpc, email, referral) | Ja |
| `utm_campaign` | Kampagnen-Name (launch, first_light, sommer) | Ja |
| `utm_term` | Suchbegriff (nur bei Ads) | Nein |
| `utm_content` | Variante (A/B-Test, unterschiedliche Anzeigen) | Nein |

## Fertige Links fuer eure Kanaele

### Organische Social Media (Bio-Links, Posts)

```
Instagram Bio:
https://souleya.com?utm_source=instagram&utm_medium=social&utm_campaign=bio

Instagram Story:
https://souleya.com?utm_source=instagram&utm_medium=story&utm_campaign=launch

Facebook Seite:
https://souleya.com?utm_source=facebook&utm_medium=social&utm_campaign=bio

Facebook Post:
https://souleya.com?utm_source=facebook&utm_medium=social&utm_campaign=post_[thema]

Pinterest Pin:
https://souleya.com?utm_source=pinterest&utm_medium=social&utm_campaign=pin_[thema]

TikTok Bio:
https://souleya.com?utm_source=tiktok&utm_medium=social&utm_campaign=bio

TikTok Video:
https://souleya.com?utm_source=tiktok&utm_medium=social&utm_campaign=video_[thema]

X (Twitter):
https://souleya.com?utm_source=twitter&utm_medium=social&utm_campaign=post_[thema]
```

### Bezahlte Werbung

```
Facebook Ads:
https://souleya.com?utm_source=facebook&utm_medium=cpc&utm_campaign=[kampagne]&utm_content=[anzeige_variante]

Instagram Ads:
https://souleya.com?utm_source=instagram&utm_medium=cpc&utm_campaign=[kampagne]&utm_content=[anzeige_variante]

Google Ads:
https://souleya.com?utm_source=google&utm_medium=cpc&utm_campaign=[kampagne]&utm_term=[suchbegriff]

Pinterest Ads:
https://souleya.com?utm_source=pinterest&utm_medium=cpc&utm_campaign=[kampagne]

TikTok Ads:
https://souleya.com?utm_source=tiktok&utm_medium=cpc&utm_campaign=[kampagne]

Kleinanzeigen:
https://souleya.com?utm_source=kleinanzeigen&utm_medium=classified&utm_campaign=[anzeigen_titel]
```

### E-Mail / Newsletter

```
Willkommens-Mail:
https://souleya.com?utm_source=newsletter&utm_medium=email&utm_campaign=welcome

Woechentlicher Newsletter:
https://souleya.com?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_[datum]

First Light Einladung:
https://souleya.com?utm_source=newsletter&utm_medium=email&utm_campaign=first_light
```

### Blog-Artikel (geteilte Links)

```
Blog auf Instagram:
https://souleya.com/blog/[slug]?utm_source=instagram&utm_medium=social&utm_campaign=blog_[slug]

Blog auf Facebook:
https://souleya.com/blog/[slug]?utm_source=facebook&utm_medium=social&utm_campaign=blog_[slug]

Blog im Newsletter:
https://souleya.com/blog/[slug]?utm_source=newsletter&utm_medium=email&utm_campaign=blog_[slug]
```

### Sonstige Quellen

```
Podcast / Interview:
https://souleya.com?utm_source=[podcast_name]&utm_medium=podcast&utm_campaign=[episode]

QR-Code (Flyer, Visitenkarte):
https://souleya.com?utm_source=qr_code&utm_medium=offline&utm_campaign=[anlass]

Kooperationspartner:
https://souleya.com?utm_source=[partner_name]&utm_medium=referral&utm_campaign=kooperation

Linktree / Linksammlungen:
https://souleya.com?utm_source=linktree&utm_medium=social&utm_campaign=bio
```

## Kurzform (ohne utm_)

Vercel erkennt auch diese Kurzformen:
- `?ref=instagram` (wird wie `utm_source=instagram` behandelt)
- `?r=newsletter` (Kurzform fuer ref)

Nuetzlich fuer muendliche Weitergabe: "Geh auf souleya.com?ref=yoga_workshop"

## Naming-Konventionen

- **Alles kleingeschrieben**, keine Umlaute, keine Leerzeichen
- **Unterstriche** statt Bindestriche: `first_light` nicht `first-light`
- **Datum** im Format `YYYY_MM`: `weekly_2026_07`
- **Kampagnen** kurz und eindeutig: `launch`, `first_light`, `sommer_aktion`

## Im Vercel Dashboard

Nach dem Deployment sind die UTM-Daten unter **Analytics → Filters** sichtbar:
- Filtere nach `utm_source` um Kanaele zu vergleichen
- Filtere nach `utm_campaign` um Kampagnen auszuwerten
- Kombiniere Filter fuer detaillierte Analyse

## Interner Traffic

Admins (`is_admin`) und Beta-Tester (`is_beta_tester`) werden automatisch aus den Analytics gefiltert. Das passiert ueber den `AnalyticsProvider` im Root-Layout — ihr muesst nichts weiter tun.
