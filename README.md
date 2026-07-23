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

1. **LQK Content → 1. Setup Sheet.** A form dialog opens with four fields:
   - **Event / theme type** — a dropdown of 10 options: Islamic holiday /
     observance, class registration campaign, product promotion, thematic event
     promotion, weekly surah update, general brand awareness, milestone /
     achievement, seasonal / school term, community & testimonials, and
     fundraising / charity.
   - **Focus** — what to centre the batch on. A type-ahead list suggests focuses
     tailored to the chosen event type, or type your own. Leave blank to revolve
     around the core LQK brand identity only.
   - **Number of days** — any number from 1 to 60 (default 30).
   - **Start date** — radio buttons: Next Monday, Monday after next, First Monday
     of next month, or a Custom date picker.

   This creates a **new, auto-named tab** (e.g. `Ramadan — 13 Jul 2026`) so
   previous calendars are preserved. Every planned row is tagged with the event +
   focus, and the weekly surah still runs in the background so the Playbook,
   Friday shareable and Kid-Proof pillars stay concrete.

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
The hard-sell Sunday lands in the **last week of the batch** (not a fixed week 4).

**Per-event reshaping:** the chosen event type reshapes the flex days (Thu, Sat,
Sun) so the mix matches the goal — e.g. a **registration campaign** runs hard
Doors every Sunday plus proof/results on Saturdays, **weekly surah update** adds
extra Playbook/Kid-Proof, and **brand awareness** keeps Doors soft with no hard
sell. Mon/Tue/Wed/Fri stay fixed so the growth+trust spine is always present. The
dialog shows the plan summary for whichever event you pick, and the Doors CTA
adapts to the event (register / attend / buy / donate), always one CTA.
