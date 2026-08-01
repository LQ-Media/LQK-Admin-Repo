# Shopify theme changes — Little Quran Kids

Reference copies of changes applied to the storefront (`www.littlequrankids.sg`)
so they are reviewable in git. Shopify remains the source of truth for the live
theme.

Changes are written to an **unpublished duplicate**, previewed, then published
manually from Online Store > Themes.

---

## 1. Home screen app icon (published 1 Aug 2026)

Adding the site to the Android/Chrome home screen produced a generated **"L"**
letter tile instead of the LQK logo.

Chrome picks a home screen icon from, in order of preference:

1. a web app manifest declaring 192x192 and 512x512 icons,
2. an `apple-touch-icon`,
3. a sufficiently large `rel="icon"`.

The theme had none of them. Its whole icon setup in `layout/theme.liquid` was a
single line:

```liquid
{% if settings.favicon != blank %}<link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 64 }}">{% endif %}
```

Two independent faults:

- `config/settings_schema.json` is `[]`, so no `favicon` setting is defined and
  `settings.favicon` never resolves. The condition is always false and the tag
  never renders — pages shipped with **no icon tags at all**.
- Even had it rendered, `width: 64` is far too small for a home screen icon.

With nothing usable to find, Chrome generated the letter tile from the store name.

**Change** — replaced that line with the block in `layout/head-icons.liquid`,
and added `assets/lqk-manifest.json`:

- icons at 32 / 192 / 512 plus a 180px `apple-touch-icon`
- manifest linked with `crossorigin="anonymous"`, required because Shopify
  serves theme assets from `cdn.shopify.com` (cross-origin to the storefront)
  and a cross-origin manifest must be fetched with CORS
- absolute `start_url` and `scope` — they resolve against the *manifest* URL, so
  relative values would have pointed at the CDN
- icon source is `App_Icons.png` (1000x1000) from Content > Files, sized via the
  Shopify CDN `?width=` parameter

---

## 2. Header — Login + Register grouped on the right

See `sections/header-actions.md`. The two buttons were separate flex children
under `justify-content:space-between`, so they were pushed apart. Wrapping them
in one `.actions` element puts them side by side at the right edge.

---

## 3. Prayer times — location aware

`sections/lqk-prayer-times.liquid` + `assets/lqk-prayer-locations.js`

The section was hardcoded to Singapore: fixed latitude/longitude, a fixed `TZ=8`
offset, and MUIS method 11. Visitors anywhere else saw Singapore times.

**Detection.** The visitor's country comes from their device time zone
(`Intl.DateTimeFormat().resolvedOptions().timeZone`). This needs no permission
prompt and no third-party geo-IP lookup, so it is instant and private. Time
zones map to a country, and 24 zones that span large countries (US, Canada,
Australia, Indonesia, Malaysia, Russia, India) carry their own coordinates so
Perth does not get Sydney's times.

**Method per country.** Prayer times differ by country because the calculation
*authority* differs — twilight angles, and whether Isha is an angle or a fixed
interval after Maghrib. The location table maps each country to its AlAdhan
method: Singapore MUIS (11), Malaysia/Brunei JAKIM (17), Indonesia Kemenag (20),
Turkey Diyanet (13), Egypt (5), Saudi Umm al-Qura (4), US/Canada ISNA (2),
Pakistan/India/Bangladesh Karachi (1), and so on. It also carries the Asr school
(Hanafi for the Indian subcontinent, Shafi elsewhere), so Asr is right too.

**Override.** A country dropdown lets the visitor pick any country in the table,
plus an "Auto-detect my country" option. There is also a "Use my exact location"
button that upgrades to precise coordinates via the browser geolocation API —
this one does prompt, so it is opt-in per visitor. Both choices persist in
`localStorage`; picking a country clears any stored exact coordinates.

**API.** Calls AlAdhan `/v1/timings/DD-MM-YYYY` by `latitude`/`longitude` rather
than by city name, which avoids city-lookup failures, and passes `method`,
`school` and `timezonestring`.

**Offline fallback.** The existing astronomical calculation was generalised: it
now takes latitude, longitude, time-zone offset, the method's Fajr/Isha angles,
Asr school, and supports Isha as either an angle or a fixed number of minutes
after Maghrib (Umm al-Qura, Qatar, Gulf, Portugal). Labelled "Estimated".

**Time handling.** All "now" arithmetic goes through `Intl.DateTimeFormat` with
the location's IANA zone, and the UTC offset is derived from it, so DST is
handled and the midnight rollover happens in the *displayed* location's day, not
Singapore's.

### Settings

| Setting | Default | Notes |
|---|---|---|
| Detect visitor's country | on | Falls back to the default country below |
| Default country | Singapore (MUIS) | Used when detection is off or the country is not in the table |
| Show country dropdown | on | |
| Show "Use my exact location" | on | Hidden automatically if the browser has no geolocation |
| 24-hour times | off | |

`templates/index.json` still carries the old `city` / `country` / `method` keys
for this section. They are ignored — the new settings fall back to their schema
defaults — and Shopify will drop them the next time the section is saved in the
theme editor.

### Adding a country

Append a row to `assets/lqk-prayer-locations.js`:

```
code|country|city|lat|lng|IANA tz|AlAdhan method|school|authority|fajr angle|isha angle|isha minutes
```

Set `isha minutes` to `0` to use the angle instead. AlAdhan method IDs are listed
at https://aladhan.com/calculation-methods

### Prayer labels

Labels stay in the Singapore/Malay form (Subuh, Syuruk, Zohor, Asar, Maghrib,
Isyak) for every country, matching LQK's audience. They are not localised per
country.
