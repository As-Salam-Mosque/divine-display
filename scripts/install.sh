#!/usr/bin/env bash

set -euo pipefail

URL="https://divinedisplayapp.com/?name=assalam"
LABWC_CONFIG_DIR="${XDG_CONFIG_HOME:-${HOME}/.config}/labwc"
AUTOSTART_FILE="${LABWC_CONFIG_DIR}/autostart"
RC_FILE="${LABWC_CONFIG_DIR}/rc.xml"

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This installer currently supports apt-based systems (Raspberry Pi OS/Debian)." >&2
  exit 1
fi

SUDO=""
if [[ "${EUID}" -ne 0 ]]; then
  SUDO="sudo"
fi

install_if_missing() {
  local package="$1"
  if dpkg -s "${package}" >/dev/null 2>&1; then
    return
  fi
  ${SUDO} apt-get install -y "${package}"
}

${SUDO} apt-get update -y

if command -v chromium-browser >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium"
elif apt-cache show chromium-browser >/dev/null 2>&1; then
  install_if_missing chromium-browser
  CHROMIUM_BIN="chromium-browser"
else
  install_if_missing chromium
  CHROMIUM_BIN="chromium"
fi

mkdir -p "${LABWC_CONFIG_DIR}"

cat > "${RC_FILE}" <<'EOF'
<?xml version="1.0"?>
<labwc_config>
  <windowRules>
    <!-- Keep the display focused on Chromium and hide the pointer on startup. -->
    <windowRule
      identifier="chromium*"
      serverDecoration="no"
      skipTaskbar="yes"
      skipWindowSwitcher="yes">
      <action name="WarpCursor" to="output" x="-1" y="-1" />
      <action name="HideCursor" />
    </windowRule>
  </windowRules>
</labwc_config>
EOF

cat > "${AUTOSTART_FILE}" <<EOF
#!/usr/bin/env sh
${CHROMIUM_BIN} --kiosk "${URL}" --noerrdialogs --password-store=basic --disable-session-crashed-bubble --disable-infobars &
EOF

chmod +x "${AUTOSTART_FILE}"

echo "Wrote labwc configuration to: ${RC_FILE}"
echo "Wrote autostart file to: ${AUTOSTART_FILE}"
echo "Restart the labwc session (or reboot) to start kiosk mode."
