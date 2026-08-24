# Wall Game — how to run it on the day

Everything below works with **no internet**. Nothing is downloaded.

---

## 1. Start it

**Do not double-click `lqk-wall-game.html`.**

That opens the page as a *file*, and browsers refuse to hand the camera to a page
opened that way. This is the single most common reason the camera "doesn't work" —
there is nothing wrong with the game.

Instead:

| Laptop | What to do |
|---|---|
| **Mac** | Double-click **START-HERE.command** |
| **Windows** | Double-click **START-HERE.bat** |

A small black window opens and the game opens by itself in Chrome.
**Leave the black window open while you play.** Close it when you are finished.

The address bar should read **http://localhost:8000/...** — not `file:///...`.
If it says `file:///`, the game shows a red box telling you the same thing.

### Mac: "Apple could not verify STARTHERE.command is free of malware"

This is normal for any file downloaded from a browser or a chat. It is not a real
malware finding — macOS just quarantines anything that didn't come from the App Store.

1. Click **Done**. Never **Move to Trash**.
2. Go to  **System Settings → Privacy & Security**, scroll down to **Security**.
3. You'll see a line about `STARTHERE.command` being blocked, with an
   **Open Anyway** button. Click it and confirm with your password or Touch ID.
4. Double-click the launcher again. It runs from now on.

If the launcher still refuses, get the files from GitHub instead (**Code → Download
ZIP**) — files from a ZIP are not quarantined the same way.

*If you see "Python is not installed":* install Python 3 once from python.org
(on Windows, tick **Add Python to PATH** during the install). After that the
launcher works forever, offline.

### In a hurry, or no Python yet?

Open `lqk-wall-game.html` in **Firefox** instead of Chrome — just double-click it and
choose Firefox. Firefox is usually willing to give the camera to a file, so it may
work straight away with nothing installed. Good enough for a quick test on the wall.

Use Chrome plus the launcher for the event itself: it is the combination that has been
tested, and Firefox will ask for camera permission again every single time you open it.

---

## 1b. The Shopify version (no install, needs internet)

There is also a copy hosted on your own store, which avoids Python, launchers and
the Mac warning entirely:

**https://www.littlequrankids.sg/pages/wall-game**

Because it is an `https://` address, the camera is allowed with no setup. Open it in
Chrome on the projector laptop and it works like any other page.

The game is already installed on that page. Just open it.

**If that page ever looks broken** (raw code on screen, or a blank page), reinstall it
by hand:

1. Shopify admin → **Online Store → Pages → Wall Game**
2. In the content box, click the **`<>`** button (Show HTML)
3. Delete everything in the box
4. Open **`shopify-wall-game-page.html`** in TextEdit / Notepad, select all, copy,
   paste it into the box
5. **Save**, then reload the page

That file is a version of the game prepared specially for Shopify — it is scoped so
it cannot disturb the rest of your store's styling. Do not paste
`lqk-wall-game.html` there; it is the standalone version and is not built for it.

**Do not rely on this for the event.** The hall wifi is the exact thing this project
was built to avoid depending on. Use it for convenience and for testing; use the USB
copy on the day.

The page is live but is not in any menu, so only someone with the link will find it.
Delete it after the event if you'd rather it not exist.

---

## 2. Rig it up — behind a sheet, not in front of a wall

This is the important part, and it is why the earlier version misbehaved.

The game works out that a shape was pressed by watching that spot get darker. With
the projector **in front** of a wall, a child's own body blocks the beam before their
hand ever arrives — so a child simply walking past darkens a shape exactly as much as
a hand pressing it. The game cannot tell the difference. That is not something a
sensitivity setting can fix.

Put the projector **behind** a white sheet and the problem disappears. Nothing is
between the projector and the screen any more, so the only thing that can darken a
spot is a hand pressed against the front of the sheet.

**What you need**

| Thing | Notes |
|---|---|
| A white sheet | Thin white cloth, plain polyester, or a white shower curtain. Light must glow through it. A thick duvet cover will not work. |
| Space behind it | Roughly 2–3m, depending on your projector. Less if it is short-throw. |
| Something to hang it from | It must end up **taut**. |

**Setting it up**

1. Hang the sheet and pull it **tight**. Weight or clamp the bottom edge. A loose
   sheet sways, and the game reads sway as pressing.
2. Put the projector behind the sheet, pointing at it.
3. In the projector's menu, turn on **rear projection** (sometimes "Rear" or
   "Rear-Table"). This mirrors the picture so it reads correctly to the children in
   front. Every projector has this setting.
4. Put the camera behind as well, next to the projector but off to one side, so it is
   not looking straight into the lamp.
5. Children stand in **front**. They press the shapes they can see glowing through
   the cloth.

Don't worry that the camera sees the picture mirrored — you drag dots 1-2-3-4 onto
the brackets wherever they appear, and the game works the rest out.

**The setting in the game.** Step 1 of the setup screen asks how you've rigged it.
Leave it on **Behind a white sheet**. The other option, *In front of a wall*, exists
only for testing at your desk — it has the flaw described above and should not be
used for the event.

---

## 3. Set it up at the wall

Follow the six steps on screen, in order. Two of them matter more than the rest:

**Step 2 — Full screen first.** Press **Go full screen** *before* you mark the
corners. The gold brackets have to be in the same place during setup and during the
game. If the picture changes size after you have marked the corners, every shape
moves and nothing will trigger. The line next to the button warns you if this
happens.

**Step 4 — Mark the corners.** Drag dots **1 2 3 4** in the camera picture onto the
gold brackets you can see through the sheet. Click a dot and use the arrow keys for small
nudges (hold Shift for bigger ones). A gold outline shows the area you have marked.

Your corners, sensitivity, chosen game and camera are **remembered**. If the laptop
restarts at the venue you do not have to set it up again — but do glance at the
dots, because if the projector moved, they are wrong.

---

## 4. Choosing the camera

If the laptop has its own webcam, the game may pick that one — it points at *you*,
not at the sheet, so nothing ever triggers. Use the dropdown next to
**Restart camera** to choose the right camera. Your choice is remembered.

Start the phone app (Iriun / DroidCam) or plug the webcam in **before** pressing
**Turn on camera**.

---

## 5. Sensitivity

Use **Practice** mode for this. It shows a live readout at the top-left:

```
camera ok  ·  press 44 / need 18
```

- Press a shape. **press** must jump well past **need**.
- Shapes popping by themselves → raise the number.
- Hands not registering → lower the number.

The white line on the bar during setup is your number, so you can compare the bar
against it directly.

---

## 6. Keys during play

| Key | What it does |
|---|---|
| **Esc** | Back to setup |
| **Space** | Pause / carry on (and replay after a round ends) |
| **F** | Full screen on/off |
| **Mouse click on a shape** | Counts as a hit — rescue a stuck round without anyone at the wall |

---

## 7. If something goes wrong mid-event

| What you see | What it means |
|---|---|
| Red box at the top of the setup page | Opened as a file. Use the launcher (section 1). |
| "No camera found" | Phone app not running, or webcam not plugged in. Start it, press the button again. |
| "Another app is using it" | Close Zoom / Teams / Photo Booth, press the button again. |
| **CAMERA NOT SEEING ANYTHING** across the top during play | The camera dropped out (sleep, unplug, phone app closed). The game keeps trying by itself. If it does not come back: Esc → **Restart camera**. |
| Shapes pop by themselves | Sheet is too loose (tighten it) or sensitivity too low (raise the number). |
| Nothing triggers at all | No camera preview = camera never started. Otherwise: wrong camera chosen, corner dots wrong, or the picture changed size after you marked them. |
| Everything triggers when the house lights change | Normal — the game notices and ignores it. |

The projector and camera both go **behind** the sheet. See section 2 — this is the
part that makes a press actually register.
