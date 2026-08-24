# HANDOFF — LQK Interactive Wall Game

**For:** Claude Code
**From:** previous Claude session (chat), revised after the camera fix pass
**Date:** 24 Aug 2026
**Deadline:** 30 Aug 2026 — Kids Grand Maulid, HomeTeamNS Khatib, ~2,000 attendees

---

## 1. Who you're working with

The owner is the founder of **Little Quran Kids (LQK)**, a Singapore Islamic enrichment centre.
**He is not a coder.** Rules for this repo:

- Deliver **complete, paste-ready files**. Never send fragments like "add this to line 340".
- No build step, no npm, no bundler, no framework.
- **No CDN links, no external fonts, no remote assets.** Venue wifi is unreliable; the file must
  work fully offline from a USB stick.
- Explain changes in plain language, not jargon.
- He iterates fast with live feedback — expect "the shapes pop by themselves" style bug reports,
  not stack traces.

---

## 2. What this is

A single-file browser game projected onto a wall. Children play by **putting their hands on the
projected shapes**. There is no touchscreen and no controller — a webcam watches the wall, and the
**shadow the child casts is the button press**.

### Hardware (already decided, budget was the driving constraint)
- Projector + laptop (owned)
- One camera beside the projector, facing the wall. Cheapest options: old Android phone running
  Iriun/DroidCam as a webcam ($0), iPhone Continuity Camera ($0), or a basic USB webcam (~S$25)
- Total budget: **S$0–40**. Kinect, Wii-remote/IR-pen and IR touch frames were all rejected on cost
  and setup time.

### Hard physical requirements — CHANGED, read this
The first two handoffs specified **front projection**. That was wrong, and it is the reason the
owner's first real test failed. Brightness at a point answers "did something block the light",
not "did something touch the wall". With the projector in front, a child's body enters the beam
before their hand arrives, so a child walking past darkens a shape by exactly as much as a hand
pressing it. No threshold separates those two cases. The flood guard then made it worse: a body
shadow across several shapes looks like a room-light change, so the game ignored everything.

The rig is now **rear projection**:

- Projector **behind** a taut white sheet, with its "rear" setting on so the picture is mirrored
  for the audience in front.
- Camera **behind** as well, beside the projector but off-axis so it is not staring into the lamp.
- Children press the **front** of the sheet. Nothing is between projector and screen any more, so
  a darkening at a point can only be caused by contact.
- The sheet must be **taut**. A loose sheet sways and reads as pressing. This is the main new
  failure mode; weight or clamp the bottom edge.
- Camera must still see the entire projected rectangle plus a margin.
- The old floor "touch line" is unnecessary — bodies no longer block anything.

The mirrored camera view needs no code: calibration maps screen→camera through whatever
quadrilateral the four dots describe, and a flipped quad works exactly the same.

`S.rig` holds `"rear"` (default) or `"front"`. Front is kept only for desk testing and is
labelled as such in the UI; its detection rule is the old, unreliable one.

---

## 3. The files

| File | What it is |
|---|---|
| `lqk-wall-game.html` | The whole game. One file, vanilla JS + Canvas 2D, no dependencies. |
| `START-HERE.command` | Mac launcher — serves the folder on localhost and opens Chrome. |
| `START-HERE.bat` | Windows launcher, same job. |
| `WALL-GAME-HOW-TO-RUN.md` | Plain-language instructions written for the owner, not for a dev. |
| `shopify-wall-game-page.html` | **Generated.** The game as a Shopify page body. Do not edit. |
| `tools/make-shopify-page.py` | Regenerates the above from the game file. Run it after any game change. |

### The Shopify copy

`https://www.littlequrankids.sg/pages/wall-game` hosts the game on the store, which
gives it an `https` origin and so sidesteps the whole `file://` problem — useful for
testing on a laptop with no Python and no patience for macOS Gatekeeper. It needs
internet, so it is a convenience, **not** the event plan; the USB copy stays primary.

`tools/make-shopify-page.py` derives the page body from `lqk-wall-game.html`, which
stays the single source of truth. It does three things that matter:

1. Strips the document scaffolding (a page body is a fragment).
2. Wraps everything in `<div id="lqk">` and prefixes every CSS selector with `#lqk`.
   The game's reset (`*{margin:0}`) and its generic class names (`.btn`, `.row`,
   `.panel`, `.note`, `.step`) would otherwise restyle the surrounding theme. The
   `html, body` rule is split so only the scroll lock stays page-level — leaving the
   font there was observed leaking into the theme's `<h1>`.
3. Scopes the two `document.querySelectorAll` calls to the wrapper, so `.anchor` and
   `.mode` can never match a theme element of the same name.

It also lifts `#setup` / `#game` to `z-index:2147483000`, because a theme's sticky
header commonly sits at `z-index:9999` and would otherwise paint over the game.

Verified by building a deliberately hostile fake theme (colliding class names, its
own reset, a sticky `z-index:9999` header) and running the full play flow inside it:
every theme computed style stayed intact, the game rendered above the header, the
camera started, and a simulated shadow still scored.

If the page body ever needs updating, the owner pastes the generated file into the
page's HTML view. It cannot be pushed through the Admin API from a Claude session
without hand-transcribing ~39KB of JavaScript, which is not worth the corruption
risk — but the stored body can be read back with `graphql_query` and compared
against the local file to confirm a paste landed correctly.

### Run it — IMPORTANT, this was previously documented wrong

**An earlier version of this handoff said `file://` is a secure context in Chrome so
`getUserMedia` works. Do not repeat that.** `isSecureContext` is indeed `true` on `file://`, but
Chrome still refuses camera access there — the origin is opaque so the permission cannot be
granted or persisted. Opening the HTML by double-clicking it is the number one cause of
"I can't get the camera to work".

Always run it over http on the machine itself:

```
python3 -m http.server 8000
# then open http://localhost:8000/lqk-wall-game.html
```

The `START-HERE` launchers do exactly this (picking a free port between 8000 and 8019) and are
what the owner should use. It is all local — no internet involved.

The game detects a `file://` or non-secure origin at load and shows a red box with these
instructions, so he is never left guessing.

### Setup flow in the UI
1. **Full screen first** — calibration is only valid while the projected rectangle stays the same
   size. Changing fullscreen state after marking the corners invalidates it; the UI warns when the
   current state differs from the state the corners were marked in.
2. Turn on camera (device picker always shown; the chosen device is remembered)
3. Drag numbered dots **1 2 3 4** in the camera preview onto the gold corner brackets on the wall.
   Arrow keys nudge a focused dot. A gold outline shows the mapped quad, and a white box shows the
   patch the live meter reads.
4. Sensitivity slider + live meter, with a white tick marking the current threshold
5. Pick a mode and round length, then Start

Corners, sensitivity, mode, round length and camera choice persist in `localStorage`
(`lqk.wallgame.v1`), so a laptop restart at the venue does not mean re-calibrating.

Keys during play: `Esc` back to setup, `Space` pause / replay, `F` fullscreen, mouse click on a
shape = simulated hit (for testing with no one at the wall).

### Modes
| Mode | Behaviour |
|---|---|
| `lantern` | Lanterns appear around the wall, 4 at a time, expire after 7s. Touch to score. No reading required. |
| `huruf` | One Arabic letter is called out at top; 4 letter medallions in fixed jittered slots; touch the match. |
| `test` | Practice. No score, no timer, shapes never run out. Shows a live camera readout — use it to set sensitivity. |

---

## 4. How detection works — read this before changing anything

This is the part that will break if you touch it carelessly. The algorithm below is unchanged
from the original build; only the bugs around it were fixed.

### Pipeline
1. `grab()` draws the video into a hidden **192×144** canvas and fills a `Float32Array` of luma.
   Small resolution is deliberate — it's fast and it averages out sensor noise.
2. `mapUV(u, v)` converts a **screen-normalised** point (0..1, 0..1) into camera pixel coordinates by
   **bilinear interpolation across the calibration quad**. We deliberately map screen→camera, never
   camera→screen, so no homography inversion is needed.
3. `sample(u, v, rad)` averages luma over a small patch at that camera point.

### The trick that makes it reliable
A naive frame-differencing approach fails here, because the camera also sees the projected image
changing — every animation is "motion". Instead:

- Each target captures its **own brightness baseline** ~450ms after it appears (`SETTLE`), i.e. after
  the projector has drawn it and the camera has caught up.
- A target reads **nine patches**, not one: five spread across the inside of the shape (`readIn`)
  because a child presses wherever they like rather than dead centre, and four just outside it
  (`readOut`).
- **Rear rig (the real one):** a press can only ever make the sheet *darker*, so the drop is
  signed. It fires when the largest inside drop passes `S.thresh` **and** exceeds the outside
  drop by `S.thresh * 0.6`. That second test is what separates a hand from everything else: a
  hand darkens the inside only, while a sagging sheet, a change in room light or a body leaning
  nearby darkens inside and outside together. Something covering a whole shape still scores —
  it is genuinely touching it.
- **Front rig (desk testing only):** any absolute change past `S.thresh`, the old rule. It still
  cannot tell a touch from a passer-by; that is why it is not for the event.
- Either way, **2 consecutive camera frames** are required.
- When there's no hit, the baseline drifts slowly (`t.base += (cur - t.base) * 0.02`) to absorb
  gradual room-light changes.
- **Flood guard:** if ≥80% of armed targets trigger in the same frame, it's a room light or a
  projector flash, not children. All baselines are discarded and re-taken. In the rear rig this is
  now a second line of defence — the inside-vs-outside test already rejects whole-sheet changes
  before the guard is reached — but keep it for the front rig and for odd cases.
- `rebaseline(delay)` is called after every hit, every despawn, every resize, every fullscreen
  change and after a camera restart, because all of those move or change the pixels being watched.

### `grab()` only reports NEW camera frames
`grab()` returns `false` when `vid.currentTime` has not advanced. The screen redraws at ~60fps but
a webcam sends ~30, so without this the same frame was measured twice and `streak >= 2` was
satisfied by one real frame — halving the intended confirmation and inviting phantom hits. Keep
this check.

### Invariants — breaking any of these will cause phantom presses
1. **A target must not animate once armed.** The pop-in animation is sized to finish inside `SETTLE`.
   Any pulsing, glowing, drifting or rotating shape changes its own brightness and will fire itself.
2. **The background must stay static during play.** No ambient particles, no shimmer, no video loop.
3. **HUD elements must stay out of the target zone.** `band()` computes the legal vertical band from
   the HUD height *and the drawn extent of the shape* (a lantern's hanger reaches `r*1.22` above its
   centre). Never place shapes by centre coordinate alone — that was a real bug: medallions
   overlapped the "TOUCH THE LETTER" prompt.
   The one exception is Practice mode's diagnostic readout, which sits above the band on purpose.
4. **Bright shapes on a dark ground.** Cream/gold targets on deep green is not just brand styling —
   a bright target gives the largest possible drop when a hand presses the sheet. Do not invert.
   It also matters that the area *around* a shape stays dark and even, because that ring is the
   reference the press is measured against.
5. **No external assets.** Everything is drawn with Canvas paths and system fonts.
6. **The sampling `<video>` must stay rendered.** `#vid` is a 3px, near-transparent element in the
   viewport. `display:none` or parking it far off-screen lets a browser stop decoding frames, and
   the camera then silently reads nothing.

### Tuning knobs
| Name | Where | Default | Note |
|---|---|---|---|
| `S.thresh` | slider | 18 | Raise if shapes self-trigger, lower if hands don't register |
| `SETTLE` | const | 450ms | Raise if the camera is laggy (wifi phone cams especially) |
| `streak >= 2` | `detect()` | 2 | Camera frames required to confirm |
| baseline drift | `detect()` | 0.02 | Higher = adapts faster but hands can be "learned" as normal |
| target radius | `targetR()` | `min(W,H)*0.115` | Big on purpose — kids press with whole hands |

---

## 5. Camera robustness already in place

Do not rip these out; they were added because a live event has no debugger.

- Constraint **fallback ladder**: exact device → device → `facingMode:environment` → plain
  640×480 → bare `video:true`. A permission refusal stops the ladder immediately (a looser
  request will not help).
- Named-error translation: `NotAllowedError`, `NotFoundError`, `NotReadableError`,
  `OverconstrainedError`, `AbortError` each map to a plain-language instruction.
- Start is only enabled once frames actually arrive (`videoWidth > 0`), not merely when
  `getUserMedia` resolves.
- Track `ended` / `mute` listeners, a `visibilitychange` nudge, and a quiet auto-restart every 5s
  during play if frames stop for 2.5s — this covers laptop sleep/wake and a phone app dropping.
- An on-canvas **CAMERA NOT SEEING ANYTHING** warning during play, so a facilitator can see the
  problem from across the hall.

---

## 6. Known gaps / candidate next tasks

**Agreed but not yet built — do these first:**

1. **Separate input from game.** Detection is still welded into the game loop; `hit(t)` is the one
   place a press lands and is the natural seam. Pull it out into an input layer that emits
   "pressed at (u,v)" and put adapters behind it (mouse, rear camera, keyboard/pads, depth
   camera). Then the sensing method can change without touching game logic, and the whole show
   can be rehearsed with a mouse while hardware is still in transit.
2. **Fixed zones instead of free placement.** A few large fixed zones are far more forgiving for
   every sensing method than small shapes at random positions, they let children queue at a spot,
   and they are what contact-pad hardware would need. Recommended for stage use.

**Fallback hardware if rear projection turns out to be impossible at the venue**, in order of how
much I'd trust them on stage: contact pads behind the sheet wired to an Arduino as keypresses
(bulletproof, fixed zones only); a second-hand depth camera (measures real distance, but needs a
native app and driver setup, which is a risk on the day); an infrared light curtain plus a camera
with its IR filter removed (elegant, fiddliest to tune).

Other gaps, roughly in priority order for the event:

1. **Team vs team mode** — split the wall left/right, two scores, for stage use with two groups.
2. **Maulid skin** — the owner has an established "Cream & Gold Majlis" theme: green Nabawi dome,
   gold geometric patterns, and Pixar-style boy/girl mascots. Ask him for the assets before
   inventing any. Mascots would have to be static (see invariant 1).
3. **Attract / idle screen** for when nobody is playing between sessions.
4. **Sound** is a bare WebAudio sine blip. Could use a nicer hit sound (must be embedded, not
   fetched). The AudioContext is created from a real click/keypress and resumed on each use, so it
   is not silently suspended.
5. **Multi-hit** — several children pressing at once is handled (every fired target in a frame is
   scored) but has not been stress-tested with real bodies.
6. **Timing under stage lights** — untested. Bright ambient light reduces shadow contrast; may need a
   higher threshold or dimming the house lights over the wall.

Done since the first handoff: calibration now persists across reloads; the pause timer no longer
eats the round clock; the end card survives a resize.

---

## 7. Test checklist before the event

- [ ] Runs offline, no network, from USB **via the START-HERE launcher**
- [ ] Camera survives a laptop sleep/wake cycle (auto-restart should handle it)
- [ ] Calibration holds after a browser resize / fullscreen toggle
- [ ] 20 minutes continuous play with no phantom hits
- [ ] Mouse-click fallback still works (so a facilitator can rescue a stuck round)
- [ ] Legible from the back of the hall — check target and HUD sizes at real throw distance
- [ ] Test at the actual venue lighting level, not in an office

---

## 8. First thing to do

Ask the owner **which of section 6 he wants first**, and whether he has tested the current build
against a real wall yet. Do not refactor the detection loop unprompted — it is the only fragile part
and it currently works.
