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

### Card layout

Three rows:

1. **Controls, above the cards** — country dropdown, "Use exact location",
   the locality chip, and the Qibla chip. Everything location-related.
2. **The prayer cards.**
3. **Below the cards** — next-prayer countdown on the left; date, Hijri date and
   the source chip (`Live · JAKIM`) on the right.

### Locality detail

The chip shows as precise a place as the browser will allow:

| Source | Shows |
|---|---|
| Exact location granted | `Dengkil, Selangor` — reverse-geocoded from GPS |
| Time-zone detection | `Kuala Lumpur · detected` — the country's default city |
| Country picked manually | that country's default city |

Locality names need real coordinates, so they only appear after the visitor taps
**Use exact location**. Time-zone detection can only ever resolve to a country,
and reverse-geocoding a country centroid would just echo the city already shown.

Reverse geocoding uses BigDataCloud's `reverse-geocode-client` endpoint, which is
free, keyless and CORS-enabled for browser use. The result is cached in
`localStorage` against coordinates rounded to 3 decimal places (~110 m), so it is
fetched once rather than on every page load. If the lookup fails the chip falls
back to "Your exact location" — times and Qibla are unaffected, since both work
from the raw coordinates and never depend on the name.

`enableHighAccuracy` is set on the geolocation request, since a locality label is
only meaningful at that precision.

### Chip styling

All items in a row share one type scale:

- chips, dropdown and button all use `700 12px/1` with `padding:6px 12px` and a
  `999px` radius, so their heights match exactly
- the dropdown has `appearance:none` with a globe glyph inset left and a CSS
  chevron inset right, keeping it the same shape as a chip rather than a native
  select control
- `max-width:180px` plus `text-overflow:ellipsis` stops long country names
  stretching the row
- icons are 13px, dots 7px, and `white-space:nowrap` keeps each item on one line
- under 720px `.meta` drops `margin-left:auto` and takes full width, so the strip
  wraps under the countdown instead of squeezing beside it

The date chip shows weekday, day and month; the year was dropped to keep the
longer row compact.

### Qibla compass

A Qibla chip sits in the same row, between the location button and the info
chips.

**Bearing.** Computed, not tabulated — the initial great-circle bearing from the
active location to the Kaaba (21.4225 N, 39.8262 E):

```
θ = atan2( sin Δλ · cos φ₂,  cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ )
```

Because it runs off the same resolved coordinates as the prayer times, it
follows the country automatically, and sharpens if the visitor grants exact
location. Spot-checked against published values: Singapore 293.0°, London
119.0°, Cairo 136.1°, New York 58.5°, Dubai 258.2°, Sydney 277.5°, Jakarta
295.2° — all within a degree. Singapore matches the 293 that was previously
hardcoded in the section settings, which is where that number came from.

**Compass.** Tapping the chip starts the device orientation listener and the
needle rotates to point at the Qibla (`qibla − heading`). Before that, the
needle shows the bearing as if north were up, and the degree figure is correct
and useful on its own — desktop included.

Heading is read as:

- iOS — `event.webkitCompassHeading`, a true compass heading. iOS 13+ requires
  `DeviceOrientationEvent.requestPermission()` from a user gesture, which is why
  the chip is a button rather than something that starts automatically.
- elsewhere — `deviceorientationabsolute` and `360 − alpha`. Plain
  `deviceorientation` alpha is only accepted when `event.absolute === true`;
  a relative reading is not referenced to magnetic north and would point
  nowhere useful.

Both add `screen.orientation.angle` so a rotated phone still points correctly.

Accuracy is bounded by the phone's magnetometer — a figure-eight wave
recalibrates it, and metal or a magnetic case will pull it off. The degree
reading is exact regardless; only the needle depends on the sensor.

The old manual `qibla` number setting (293) is gone from this section, replaced
by the calculation. `templates/index.json` may still carry the key; it is
ignored. The separate `qibla` setting on `lqk-kids-corner` is untouched.

---

## 4. Qibla camera finder page

`sections/lqk-qibla-ar.liquid` + `templates/page.qibla.json` + a Shopify page at
`/pages/qibla` (handle `qibla`, template suffix `qibla`).

Tapping the Qibla chip now **navigates** to a full-screen camera view instead of
starting the compass in place. The chip's needle became static (bearing with
north up) because a link cannot also be a compass toggle.

**Rendering.** The compass fires faster than the screen paints, so readings are
stored and drawn once per animation frame. Everything that tracks the compass is
positioned with `translate3d` (compositor) rather than `left` (layout), and
carries **no CSS transition** — a transition restarts on every reading, which is
what made the marker trail behind the phone. The smoothing filter is light (0.35
per frame) so noise is damped without visible lag.

**Compass strip.** A tick strip across the top spans the same field of view as
the camera, with cardinal labels every 45°, minor ticks every 15°, and an orange
Qibla tick. Ticks are created once and only their transforms are updated;
anything outside the view is display-none'd rather than repositioned. Because the
strip and the marker use the same degrees-to-pixels scale, the Qibla tick sits
directly above the marker.

**Found signal.** Within tolerance the ring turns solid orange, the marker scales
up, a two-note WebAudio chime plays, the phone vibrates once, and a pill reading
**"Qibla found"** appears under the ring. Entry and exit use hysteresis (enter at
tolerance, leave at tolerance + 3°) so standing on the boundary cannot re-fire the
chime. The `AudioContext` is created during the Start tap, since browsers refuse
to start audio outside a gesture. Both the text and the chime are theme settings.

**Marker placement.** The Kaaba marker is positioned horizontally by the signed
angular difference between heading and Qibla bearing:

```
left% = 50 + (delta / (FOV/2)) * 50
```

So the marker tracks a real-world direction as the phone turns. When the Qibla
falls outside the camera's field of view the marker is replaced by an edge arrow
with the number of degrees to turn. Within the tolerance (5° default) the ring
turns solid orange, the marker scales up, the phone vibrates once, and the hint
reads "You are facing the Qibla".

`FOV` is a guess at the camera's horizontal field of view — 62° suits most phone
rear cameras. It is a theme setting: if the marker drifts ahead of the true
direction, lower it.

**Location** reuses the same `localStorage` keys as the prayer card
(`lqk-pt-country`, `lqk-pt-coords`) and the same country table, so whichever
country the visitor picked there carries into the finder. Bearing is recomputed
from those coordinates, not passed through a URL.

**Permissions.** One tap on Start requests orientation *then* camera, in that
order — iOS only grants `DeviceOrientationEvent.requestPermission()` inside the
gesture, and awaiting the camera prompt first can lose it. Each degrades
independently:

| Situation | Behaviour |
|---|---|
| Camera denied | Compass still drives the marker over a dark background |
| No compass | Static bearing in degrees, with an explanation |
| Neither | Bearing in degrees; still useful |
| Not HTTPS | `getUserMedia` is unavailable; the compass path still runs |

The video track is stopped on `pagehide` so the camera indicator does not stay
lit after leaving.

**Marker image.** `image_picker` setting on the section, with a drawn SVG Kaaba
as the fallback so the page works before any upload. A square transparent PNG
gives the best result.

**Note on the page.** It is published and publicly reachable at `/pages/qibla`,
but nothing links to it except the chip, which only exists in this theme. Until
the theme is published, that URL falls back to the default page template and
shows the placeholder body text.

### Settings

| Setting | Default | Notes |
|---|---|---|
| Detect visitor's country | on | Falls back to the default country below |
| Default country | Singapore (MUIS) | Used when detection is off or the country is not in the table |
| Show country dropdown | on | |
| Show "Use exact location" | on | Hidden automatically if the browser has no geolocation |
| Show Qibla compass | on | Degrees always shown; needle needs a device compass |
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
