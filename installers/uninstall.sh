#!/usr/bin/env bash
set -euo pipefail

# --- Color/Format Functions ---
setup_colors() {
  if [[ -t 1 ]] && [[ -z "${NO_COLOR:-}" ]]; then
    GREEN='\033[0;32m'
    CYAN='\033[0;36m'
    RESET='\033[0m'
  else
    GREEN='' CYAN='' RESET=''
  fi
}

msg_success() {
  echo -e "${GREEN}[OK] $1${RESET}"
}

msg_info() {
  echo -e "${CYAN}[i] $1${RESET}"
}

setup_colors

echo "Uninstalling ccs..."
echo ""

# Remove from ~/.local/bin (standard location)
if [[ -L "$HOME/.local/bin/ccs" ]]; then
  rm "$HOME/.local/bin/ccs"
  msg_success "Removed: $HOME/.local/bin/ccs"
elif [[ -f "$HOME/.local/bin/ccs" ]]; then
  rm "$HOME/.local/bin/ccs"
  msg_success "Removed: $HOME/.local/bin/ccs"
fi

if [[ -L "$HOME/.local/bin/ccs-uninstall" ]]; then
  rm "$HOME/.local/bin/ccs-uninstall"
  msg_success "Removed: $HOME/.local/bin/ccs-uninstall"
fi

# Ask about ~/.ccs directory
if [[ -d "$HOME/.ccs" ]]; then
  read -p "Remove CCS directory ~/.ccs? This includes config and profiles. (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$HOME/.ccs"
    msg_success "Removed: $HOME/.ccs"
  else
    msg_info "Kept: $HOME/.ccs"
  fi
else
  msg_info "No CCS directory found at $HOME/.ccs"
fi

echo ""
msg_success "Uninstall complete!"
