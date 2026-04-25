#!/usr/bin/env bash
# Reset all dev-mode state for focusd so the next `npm run dev` starts from
# a clean slate (used to test the onboarding + permission flow).
#
# Designed to be safe alongside a packaged install of focusd on the same
# machine. See "Production safety" notes below.
#
# Clears (always):
#   - macOS TCC entries (Screen Recording + Microphone) for the launchers that
#     typically spawn the dev binary: Electron itself, iTerm, Terminal, VS
#     Code, Cursor. The production bundle id (com.videodb.focusd) is
#     intentionally NOT reset — see below.
#   - Any orphaned recorder / meet_detector processes that were spawned from
#     this app's userData/bin directory (path-scoped — won't touch unrelated
#     processes).
#   - Generic Electron dev userData dir (~/Library/Application Support/Electron),
#     which Electron uses before the app sets `app.name`.
#
# Clears (only when safe or with --force):
#   - The userData dir at "~/Library/Application Support/VideoDB Focusd".
#     Dev and prod share this path because `app.name = 'VideoDB Focusd'` in
#     both modes, so wiping it would also clear a packaged install's
#     onboarding/api-key/database. The script aborts if it sees a packaged
#     install at /Applications/VideoDB Focusd.app unless --force is passed.
#
# Does NOT touch:
#   - macOS Keychain. focusd uses Electron `safeStorage`; the encrypted blob
#     lives inside userData and goes away with it.
#   - The packaged app bundle, source code, node_modules, or build outputs.
#   - TCC entries for any app outside the explicit dev-launcher list.
#
# Usage:
#   npm run reset:dev
#   npm run reset:dev -- --force   # also wipe userData when prod app is installed

set -u

if [[ "$(uname)" != "Darwin" ]]; then
  echo "reset-dev.sh: macOS only. Adapt paths for your platform if needed." >&2
  exit 1
fi

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

USER_DATA="$HOME/Library/Application Support/VideoDB Focusd"
ELECTRON_DEV_DATA="$HOME/Library/Application Support/Electron"
PROD_APP="/Applications/VideoDB Focusd.app"

echo "==> Killing any orphaned focusd-spawned processes..."
# Path-scoped to userData/bin so we never hit unrelated processes.
pkill -f "VideoDB Focusd/bin/recorder"      2>/dev/null || true
pkill -f "VideoDB Focusd/bin/meet_detector" 2>/dev/null || true
sleep 1

echo "==> Resetting macOS TCC for dev launchers..."
# Production bundle id (com.videodb.focusd) is intentionally excluded — a
# packaged install on the same machine should keep its grants.
for bundle in \
    com.github.Electron \
    com.googlecode.iterm2 \
    com.apple.Terminal \
    com.microsoft.VSCode \
    com.todesktop.230313mzl4w4u92; do  # Cursor
  tccutil reset ScreenCapture "$bundle" 2>/dev/null \
    && echo "  ScreenCapture reset for $bundle" || true
  tccutil reset Microphone   "$bundle" 2>/dev/null \
    && echo "  Microphone   reset for $bundle" || true
done

echo "==> Removing generic Electron dev dir..."
rm -rf "$ELECTRON_DEV_DATA" \
  && echo "  removed: $ELECTRON_DEV_DATA" || true

# UserData wipe — guard against clobbering a packaged install.
if [[ -d "$PROD_APP" && $FORCE -eq 0 ]]; then
  echo ""
  echo "Skipping userData wipe."
  echo "  Reason: a packaged install was found at $PROD_APP and dev/prod"
  echo "  share the userData dir ($USER_DATA)."
  echo "  Wiping it would also clear the packaged app's onboarding, API key,"
  echo "  and database."
  echo ""
  echo "  If that's intentional, re-run with: npm run reset:dev -- --force"
  echo ""
  echo "Done (TCC + Electron dev dir cleared; userData preserved)."
  exit 0
fi

echo "==> Removing dev userData..."
rm -rf "$USER_DATA" \
  && echo "  removed: $USER_DATA" || true

echo ""
echo "Done. Next \`npm run dev\` will start from a clean slate."
