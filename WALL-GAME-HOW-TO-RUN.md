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

*Mac, first time only:* if macOS says the launcher is from an unidentified developer,
right-click it → **Open** → **Open**. You only do this once.

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

## 2. Set it up at the wall

Follow the five steps on screen, in order. Two of them matter more than the rest:

**Step 1 — Full screen first.** Press **Go full screen** *before* you mark the
corners. The gold brackets have to be in the same place during setup and during the
game. If the picture changes size after you have marked the corners, every shape
moves and nothing will trigger. The line next to the button warns you if this
happens.

**Step 3 — Mark the corners.** Drag dots **1 2 3 4** in the camera picture onto the
gold brackets you can see on the wall. Click a dot and use the arrow keys for small
nudges (hold Shift for bigger ones). A gold outline shows the area you have marked.

Your corners, sensitivity, chosen game and camera are **remembered**. If the laptop
restarts at the venue you do not have to set it up again — but do glance at the
dots, because if the projector moved, they are wrong.

---

## 3. Choosing the camera

If the laptop has its own webcam, the game may pick that one — it points at *you*,
not at the wall, so nothing ever triggers. Use the dropdown next to
**Restart camera** to choose the right camera. Your choice is remembered.

Start the phone app (Iriun / DroidCam) or plug the webcam in **before** pressing
**Turn on camera**.

---

## 4. Sensitivity

Use **Practice** mode for this. It shows a live readout at the top-left:

```
camera ok  ·  change 44 / need 18
```

- Put a hand on a shape. **change** must jump well past **need**.
- Shapes popping by themselves → raise the number.
- Hands not registering → lower the number.

The white line on the bar during setup is your number, so you can compare the bar
against it directly.

---

## 5. Keys during play

| Key | What it does |
|---|---|
| **Esc** | Back to setup |
| **Space** | Pause / carry on (and replay after a round ends) |
| **F** | Full screen on/off |
| **Mouse click on a shape** | Counts as a hit — rescue a stuck round without anyone at the wall |

---

## 6. If something goes wrong mid-event

| What you see | What it means |
|---|---|
| Red box at the top of the setup page | Opened as a file. Use the launcher (section 1). |
| "No camera found" | Phone app not running, or webcam not plugged in. Start it, press the button again. |
| "Another app is using it" | Close Zoom / Teams / Photo Booth, press the button again. |
| **CAMERA NOT SEEING ANYTHING** across the top during play | The camera dropped out (sleep, unplug, phone app closed). The game keeps trying by itself. If it does not come back: Esc → **Restart camera**. |
| Shapes pop by themselves | Raise the sensitivity number. |
| Nothing triggers at all | Wrong camera chosen, or the corner dots are wrong, or the picture changed size after you marked them. |
| Everything triggers when the house lights change | Normal — the game notices and ignores it. |

Front projection only: the projector must be **in front of** the wall, so the
children's shadows land on the picture.
