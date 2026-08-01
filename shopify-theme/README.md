# Shopify theme change — home screen app icon

Reference copy of the change applied to the Little Quran Kids storefront
(`www.littlequrankids.sg`) so it is reviewable in git. Shopify remains the
source of truth for the live theme.

## Problem

Adding the site to the Android/Chrome home screen produced a generated **"L"**
letter tile instead of the LQK logo.

Chrome picks a home screen icon from, in order of preference:

1. a web app manifest declaring 192x192 and 512x512 icons,
2. an `apple-touch-icon`,
3. a sufficiently large `rel="icon"`.

The live theme (`LQK 2026 Theme | Sunrise`) had none of them. Its whole icon
setup in `layout/theme.liquid` was a single line:

```liquid
{% if settings.favicon != blank %}<link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 64 }}">{% endif %}
```

Two independent faults:

- `config/settings_schema.json` in this theme is `[]`, so no `favicon` setting is
  defined and `settings.favicon` never resolves. The condition is always false and
  the tag never renders — the pages shipped with **no icon tags at all**.
- Even had it rendered, `width: 64` is far too small for a home screen icon.

With nothing usable to find, Chrome generated the letter tile from the store name.

## Change

Replaced that line in `layout/theme.liquid` with the block in
`layout/head-icons.liquid`, and added `assets/lqk-manifest.json`.

- Icons at 32 / 192 / 512 plus a 180px `apple-touch-icon`.
- A web app manifest linked with `crossorigin="anonymous"`, required because
  Shopify serves theme assets from `cdn.shopify.com` (cross-origin to the
  storefront) and a manifest fetched cross-origin must use CORS.
- `start_url` and `scope` are absolute storefront URLs. They are resolved against
  the manifest URL, so relative values would have pointed at the CDN.
- Icon source is `App_Icons.png` (1000x1000) from Content > Files, sized via the
  Shopify CDN `?width=` parameter.

Nothing else in the layout was modified.

## Applying it

Written to the unpublished theme **"LQK Sunrise — Home screen app icon fix"**.
Preview it, then publish from Online Store > Themes when it looks right.

## Notes

- The icon is referenced by its CDN URL rather than a theme setting, because this
  theme defines no theme settings. To swap the icon later, change the
  `lqk_app_icon` value in `layout/theme.liquid` and the two `src` values in
  `assets/lqk-manifest.json`.
- `"display": "standalone"` makes the installed shortcut open without browser
  chrome. Change it to `"browser"` for a plain bookmark instead.
- `short_name` is the home screen label. It is left as the full store name to
  match existing behaviour; shorten it if Android truncates it awkwardly.
- Devices cache home screen icons aggressively. To retest, remove the existing
  shortcut, hard-refresh the site, then re-add it.
