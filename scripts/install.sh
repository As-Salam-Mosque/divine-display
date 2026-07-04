#!/usr/bin/env bash

set -euo pipefail

URL="https://divine-display.onrender.com/?name=assalam"
AUTOSTART_FILE="${HOME}/.config/labwc/autostart"

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

if apt-cache show chromium-browser >/dev/null 2>&1; then
  install_if_missing chromium-browser
else
  install_if_missing chromium
fi

install_if_missing ydotool

CHROMIUM_BIN="chromium"
if command -v chromium-browser >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium-browser"
fi

if command -v systemctl >/dev/null 2>&1; then
  if ${SUDO} systemctl list-unit-files --type=service | grep -q '^ydotoold\.service'; then
    ${SUDO} systemctl enable --now ydotoold.service
  elif ${SUDO} systemctl list-unit-files --type=service | grep -q '^ydotool\.service'; then
    ${SUDO} systemctl enable --now ydotool.service
  else
    echo "Warning: no ydotool systemd service unit was found. Cursor move may fail until ydotoold is started."
  fi
fi

mkdir -p "$(dirname "${AUTOSTART_FILE}")"

cat > "${AUTOSTART_FILE}" <<EOF
#!/usr/bin/env sh
${CHROMIUM_BIN} --kiosk ${URL} --noerrdialogs --disable-session-crashed-bubble --disable-infobars &
sleep 12; ydotool mousemove --absolute -x 10000 -y 10000 &
EOF

echo "Wrote autostart file to: ${AUTOSTART_FILE}"
echo "Restart the labwc session (or reboot) to start kiosk mode."
