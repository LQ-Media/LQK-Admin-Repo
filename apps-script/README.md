# LQK Brand Image Generator — v7 (Structured Brief System)

Google Apps Script that turns a Google Sheet into a branded AI image pipeline for
Little Quran Kids (event posters, IG posts, story/reel covers) using Google's
Gemini image models ("Nano Banana" family).

## What changed from v6

| | v6 | v7 |
|---|---|---|
| Prompting | One free-text prompt column | Structured brief: 9 input columns (B–J) assembled into a consistent prompt |
| Model | Nano Banana Pro only | Per-row **Quality**: Draft = `gemini-2.5-flash-image` (cheap), Final = `gemini-3-pro-image-preview` (best text/detail) |
| Aspect ratio | Not controlled | **Content Type** dropdown auto-sets it (IG Post 1:1, Story/Reel 9:16, Poster 3:4, Banner 16:9…) |
| References | All 5 images sent on every call | **Characters** dropdown attaches only the references the scene needs (cheaper, more consistent) |
| Poster text | Not supported | **Text Overlay** column renders exact marketing text; Arabic-only rule now applies to in-scene wall art only |
| API key | Hardcoded in the script | Stored in Script Properties via the **Set API Key** menu |

## Sheet layout (`Prompts` tab)

| Col | Header | Who fills it | Notes |
|---|---|---|---|
| A | Image Title | Staff | Becomes the file name |
| B | Content Type | Staff (dropdown) | Sets the aspect ratio automatically |
| C | Scene & Action | Staff | **Required** — what's happening |
| D | Characters | Staff (dropdown) | Controls which reference images are sent |
| E | Location & Setting | Staff | Where the scene happens |
| F | Camera Angle & Framing | Staff (dropdown or free text) | |
| G | Logo Placement | Staff | Blank = subtle background placement |
| H | Text Overlay (exact text) | Staff (optional) | Rendered letter-for-letter; keep it short |
| I | Mood & Lighting | Staff (dropdown or free text) | |
| J | Quality | Staff (dropdown) | Draft (cheap) / Final (best) |
| K | Status | Script | Working… / DONE / ERROR |
| L | Image Link | Script | Drive link to the result |

An `Instructions` tab with per-column guidance for staff is generated automatically.

## Setup (one time)

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Replace the old script with the contents of `Code.gs`, then save.
3. Reload the Sheet. A **🖼️ LQK Images** menu appears.
4. Run **🛠️ Setup / Repair Sheet** — builds headers, dropdowns, and the Instructions tab.
5. Run **🔑 Set API Key** and paste your Google AI Studio key.
   **Never paste the key into the code or the sheet.** If a key was ever committed or
   shared, revoke it in [Google AI Studio](https://aistudio.google.com/apikey) and create a new one.
6. Check the five brand asset links (`BOY_URL` … `TEACHER_BLACK_URL`) at the top of
   `Code.gs` still point to your reference images in Drive.

## Daily use (staff workflow)

1. Fill one row per image, starting at row 2. Only **Scene & Action** is mandatory.
2. Set **Quality = Draft (cheap)** and run **▶️ Generate All Pending** to test the idea.
3. Tweak the brief until the draft looks right (clear the Status cell to re-run a row,
   or select the row and use **▶️ Generate Selected Rows** to force a re-render).
4. Switch **Quality = Final (best)**, clear the Status cell, and generate the final image.
5. Grab the result from the **Image Link** column (also saved in the
   `LQK Generated Images` Drive folder).

Brand rules (Pixar 3D style, orange/cream palette, logo in every render, modest dress
code, Arabic-only wall text, Islamic architecture, etc.) are injected automatically on
every call — staff never need to type them.

## Notes

- Apps Script runs stop themselves after ~4.5 minutes to avoid the 6-minute timeout;
  just run **Generate All Pending** again and it continues where it left off.
- Transient API errors (429 rate limit, 5xx) are retried automatically with backoff.
- Long overlay text renders badly on any image model — keep it to a headline + one line.
