# LQK-Admin-Repo

Source of truth for the Little Quran Kids content pipeline's hand-written pieces.

The pipeline itself runs as scheduled Claude tasks against two published artifacts and a
Google Drive folder; this repo tracks the parts that are worth having a history for.

| Path | What it is |
| --- | --- |
| `dashboard/lqk-media-dashboard.html` | Source of the **LQK Media Dashboard** artifact — the page the team reviews and approves posts on. Publish it back to the same artifact URL to deploy. |
| `runbook/RUNBOOK-ADDENDUM-style-clones.txt` | RUNBOOK section 16, the spec the hourly run follows for style clones. Mirrors the Google Doc *RUNBOOK ADDENDUM - STYLE CLONES* in the `00 Config` Drive folder, which is what the run actually reads. |

Behaviour changes go in the Drive documents (RUNBOOK, CONFIG) or in the dashboard's own
settings — the scheduled task prompts only say "follow the RUNBOOK". Keep this repo in step
with them when either changes.
