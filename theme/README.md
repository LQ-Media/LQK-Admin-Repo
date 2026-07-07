# LQK Teachers Portal — Shopify theme source

Source of truth for the custom files layered on top of the **Clarity** theme on
the LQK Teachers store (`teachers.littlequrankids.sg`, admin handle `3f772b-b7`).

## How the portal is wired

The Teacher Portal is a single-page app rendered by a `custom-liquid` section:

| File | Purpose |
| --- | --- |
| `assets/lqk-portal.js` | The whole portal app: PIN/customer-tag gate, roster, lesson logging (Google Apps Script backend), prayer times, ayah of the day, share cards. Also hides the theme header/footer. |
| `assets/lqk-portal.css` | Portal styles + Clarity layout integration (neutralises the theme's flex/gut wrappers). |
| `templates/index.json` | Homepage — renders the portal markup via a custom-liquid section that loads the two assets above. |
| `templates/page.lqk-portal.json` | Dedicated template for the "LQK Teachers Portal" page (`/pages/lqk-teachers-portal`, template suffix `lqk-portal`). Identical portal section as the homepage. |
| `templates/page.json` | Stock Clarity default page template (title + page content). Kept stock so ordinary pages don't turn into the portal. |

The portal markup lives inside the `custom_liquid` setting of the JSON
templates. It exposes the logged-in customer to the app via
`window.SHOPIFY_TEACHER` (email, tags, first name); teachers are routed to
their branch by a `branch:<CLASS NAME>` customer tag, admins by an `admin` tag,
with a PIN fallback for shared devices.

`assets/lqk-gate.png` (login gate illustration) also ships with the theme but
is a binary asset managed in the Shopify admin.

## Deploying changes

Shopify blocks API writes to the live (published) theme. Workflow:

1. Edit files on an **unpublished** copy of the theme via the Admin GraphQL API
   (`themeFilesUpsert`) or the theme code editor.
2. Verify with a preview link: `https://3f772b-b7.myshopify.com/?preview_theme_id=<THEME_ID>`.
3. Publish the copy from **Online Store → Themes** in the Shopify admin
   (publishing via API is intentionally blocked).

## History

- Jul 2026: portal was originally pasted inline into `templates/page.json`
  (44 KB custom-liquid blob with an old app version) and the raw JS was pasted
  without `<script>` tags into `templates/index.json`, rendering source code as
  text on the homepage. Both were rebuilt to load the shared assets above, on
  the theme copy "Clarity + portal fix (Claude)".
