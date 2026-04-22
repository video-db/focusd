#!/bin/bash
set -euo pipefail

# Focusd installer
# Usage: curl -fsSL https://artifacts.videodb.io/focusd/install | bash

APP_NAME="VideoDB Focusd"
DISPLAY_NAME="Focusd"
APP_DIR="/Applications/${APP_NAME}.app"
BASE_URL="https://artifacts.videodb.io/focusd"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { printf "${BLUE}${BOLD}==>${NC} ${BOLD}%s${NC}\n" "$1"; }
success() { printf "${GREEN}${BOLD}==>${NC} ${BOLD}%s${NC}\n" "$1"; }
warn()    { printf "${YELLOW}${BOLD}warning:${NC} %s\n" "$1"; }
error()   { printf "${RED}${BOLD}error:${NC} %s\n" "$1" >&2; exit 1; }

if [ "$(uname)" != "Darwin" ]; then
  error "This installer only supports macOS."
fi

if ! command -v curl >/dev/null 2>&1; then
  error "curl is required but not found."
fi

if ! command -v hdiutil >/dev/null 2>&1; then
  error "hdiutil is required but not found."
fi

ARCH="$(uname -m)"
case "$ARCH" in
  arm64) ARTIFACT_ARCH="arm64" ;;
  x86_64) ARTIFACT_ARCH="x64" ;;
  *) error "Unsupported architecture: $ARCH" ;;
esac

echo ""
printf "${BOLD}  %s Installer${NC}\n" "$DISPLAY_NAME"
echo "  -----------------"
echo ""
info "Detected architecture: $ARCH"
info "Resolving latest version..."

VERSION="$(curl -fsSL "${BASE_URL}/latest-version.txt")" || error "Failed to fetch the latest version."
DMG_FILE="focusd-${VERSION}-${ARTIFACT_ARCH}.dmg"
DMG_URL="${BASE_URL}/${DMG_FILE}"

info "Downloading ${DMG_FILE}..."

TMP_DIR="$(mktemp -d)"
TMP_DMG="${TMP_DIR}/${DMG_FILE}"
MOUNT_POINT=""

cleanup() {
  if [ -n "$MOUNT_POINT" ] && [ -d "$MOUNT_POINT" ]; then
    hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

curl -fSL --progress-bar "$DMG_URL" -o "$TMP_DMG" || error "Failed to download ${DMG_URL}"

success "Download complete."

info "Mounting disk image..."
while IFS= read -r line; do
  case "$line" in
    *$'\t'/Volumes/*)
      MOUNT_POINT="${line##*$'\t'}"
      break
      ;;
  esac
done < <(hdiutil attach "$TMP_DMG" -nobrowse)

if [ -z "$MOUNT_POINT" ] || [ ! -d "$MOUNT_POINT" ]; then
  error "Failed to mount disk image."
fi

SOURCE_APP="${MOUNT_POINT}/${APP_NAME}.app"
if [ ! -d "$SOURCE_APP" ]; then
  error "Could not find ${APP_NAME}.app in the disk image."
fi

if [ -d "$APP_DIR" ]; then
  warn "Existing installation found. Replacing..."
  rm -rf "$APP_DIR"
fi

info "Installing to /Applications..."
cp -R "$SOURCE_APP" "$APP_DIR" || error "Failed to copy app to /Applications. You may need to run with sudo."

info "Removing quarantine attribute..."
xattr -cr "$APP_DIR" 2>/dev/null || true

info "Cleaning up..."
hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null || true
MOUNT_POINT=""

echo ""
success "${DISPLAY_NAME} has been installed to /Applications!"
echo ""
echo "  Next steps:"
echo "    1. Open ${APP_NAME} from Applications or Spotlight"
echo "    2. Grant the permissions the app requests when prompted"
echo "    3. Start tracking with ${DISPLAY_NAME}"
echo ""
