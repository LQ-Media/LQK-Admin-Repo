#!/bin/bash
# ============================================================
#  LQK Wall Game — Mac launcher
#  Double-click this file. It opens the game the way the camera
#  is allowed to work. No internet needed.
# ============================================================

cd "$(dirname "$0")" || exit 1

GAME="lqk-wall-game.html"

if [ ! -f "$GAME" ]; then
  echo "Cannot find $GAME next to this launcher."
  echo "Keep both files in the same folder."
  read -r -p "Press Enter to close. " _
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "This Mac does not have Python 3."
  echo
  echo "Install it once from https://www.python.org/downloads/ ,"
  echo "then double-click this launcher again."
  read -r -p "Press Enter to close. " _
  exit 1
fi

# Find a free port, in case something else is already using 8000.
PORT=$(python3 - <<'PY'
import socket
for p in range(8000, 8020):
    s = socket.socket()
    try:
        s.bind(("127.0.0.1", p))
        print(p)
        break
    except OSError:
        pass
    finally:
        s.close()
PY
)
[ -z "$PORT" ] && PORT=8000

URL="http://localhost:$PORT/$GAME"

echo "Starting the Wall Game..."
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!

# Give the little server a moment, then open the browser.
sleep 1

if command -v open >/dev/null 2>&1; then
  open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"
else
  echo "Open this address in Chrome yourself:"
fi

echo
echo "  $URL"
echo
echo "  KEEP THIS BLACK WINDOW OPEN while you play."
echo "  Close it (or press Ctrl+C) when you are finished."
echo

trap 'kill "$SRV" 2>/dev/null' EXIT
wait "$SRV"
