# LQK-Admin-Repo

Admin tooling for Little Quran Kids (LQK).

## LQK Content Engine (`Code.gs`)

A Google Apps Script that turns a Google Sheet into a theme-driven content
planner + generator for the LQK TikTok/Instagram account. It plans a batch of
days across the weekly pillar rhythm, then calls the Claude API to write the
hook, script/shot list, caption and hashtags for each post.

### One-time setup

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Paste the contents of `Code.gs` into the editor and **Save**.
3. Reload the Sheet. A **LQK Content** menu appears.
4. **LQK Content → Set / update API key** and paste your Anthropic API key
   (from console.anthropic.com → API Keys). The key is stored privately in the
   project's Script Properties — it is **not** kept in the code or the sheet.

> Security note: v2 no longer hardcodes the API key. If you used an older
> version with a key pasted into the code, **rotate that key** in the Anthropic
> console — anyone who saw the old code could use it.

### Standard operating procedure (SOP)

1. **LQK Content → 1. Setup Sheet.** Answer four prompts:
   - **Theme / Event / Idea** — what the batch is built around
     (e.g. "Ramadan 2027 prep", "Open house at Tampines"). Leave blank for a
     general evergreen batch.
   - **Number of days** — any number from 1 to 60 (default 30).
   - **Start date** — `YYYY-MM-DD` for Day 1; blank uses the next Monday.
   - **Surah focus** — the surahs that drive the weekly Parent Playbook (one
     per week). Leave blank for the default rotation, type `AUTO` to let Claude
     pick surahs that fit your theme, or type your own comma-separated list.

   This creates a **new, auto-named tab** (e.g. `Ramadan 2027 prep — 13 Jul 2026`)
   so previous calendars are preserved. Every planned row is tagged with the
   theme.

2. **LQK Content → 2. Generate All PLANNED rows.** Fills Hook, Script/Shot
   List, Caption and Hashtags for each planned row on the **active tab**,
   flavouring every generation with the batch theme. Rows move to `GENERATED`.

3. Review each row. Set **Status** to `APPROVED` (or `SKIP`) as you go. Use
   **3. Generate This Row only** to regenerate the row your cursor is on.

4. After posting, put the link in **Posted Link / Notes** and use
   **Mark selected row POSTED**.

**Choosing the model:** **LQK Content → Set generation model** lets you switch
between Sonnet, Opus, Haiku, or any model ID you paste. The choice is stored in
Script Properties and used for all generations until you change it (default
`claude-sonnet-4-6`).

### Weekly pillar rhythm

| Day | Pillar | Job |
|-----|--------|-----|
| Mon | P1 Kid Proof | Growth |
| Tue | P2 Parent Playbook | Growth |
| Wed | P3 Inside LQK | Trust |
| Thu | P4 Hot Take | Growth |
| Fri | P2 Shareable (Jumu'ah) | Growth |
| Sat | P3 / P1 (alternates by week) | Trust / Growth |
| Sun | P5 Doors — Soft, going **Hard in the final week** | Conversion |

The rhythm is day-of-week driven, so it adapts to whatever day count you pick.
The hard-sell Sunday now lands in the **last week of the batch** (not a fixed
week 4).
