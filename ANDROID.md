# CCS Android/Termux Guide

Complete guide for running CCS (Claude Code Switch) on Android devices using Termux.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Usage](#usage)
- [Remote Access](#remote-access)
- [Performance Tips](#performance-tips)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [FAQ](#faq)

---

## Overview

This fork of CCS adds native Android platform support, allowing you to run Claude Code and other AI providers directly on your Android device through Termux.

### What's Different?

| Feature | Original CCS | This Fork |
|---------|--------------|-----------|
| Android Support | Requires `--force` | Native support |
| Platform Declaration | darwin, linux, win32 | + android |
| Termux Tested | Community tested | Officially tested |

---

## Requirements

### Hardware
- Android device (ARM64 or ARM32)
- Minimum 2GB RAM (4GB+ recommended)
- 500MB+ free storage

### Software
- Android 7.0+ (API level 24+)
- [Termux](https://f-droid.org/packages/com.termux/) from F-Droid
- Node.js 14+ (via Termux packages)

> **Important:** Do NOT install Termux from Google Play Store - that version is outdated and unmaintained.

---

## Installation

### Step 1: Setup Termux

```bash
# Update package repositories
pkg update && pkg upgrade -y

# Install essential packages
pkg install nodejs git openssh -y

# Verify Node.js installation
node --version   # Should be v14+
npm --version    # Should be v6+
```

### Step 2: Install CCS

**Option A: This Fork (Recommended)**
```bash
npm install -g @zesbe/ccs-android
```

**Option B: Original CCS with Force**
```bash
npm install -g @kaitranntt/ccs --force
```

### Step 3: Verify Installation

```bash
ccs --version
# Should display: CCS (Claude Code Switch) vX.X.X
```

### Step 4: Initial Configuration

```bash
ccs config
# Opens dashboard at http://localhost:3000
```

---

## Configuration

### Config Location

```
~/.ccs/
  ├── config.yaml      # Main configuration
  ├── profiles.json    # Account profiles
  └── cliproxy/        # OAuth tokens
      └── auth/
```

### Environment Variables

```bash
# Add to ~/.bashrc or ~/.profile

# Custom Claude CLI path (if needed)
export CCS_CLAUDE_PATH="/data/data/com.termux/files/usr/bin/claude"

# Disable colors (optional)
export NO_COLOR=1

# Custom port for dashboard
export CCS_PORT=3000
```

---

## Authentication

### OAuth Providers (Gemini, Codex, Antigravity)

Since Termux runs headless (no browser), you need to manually handle OAuth:

#### Method 1: Manual URL Copy

```bash
# Start authentication
ccs agy --auth

# Output example:
# [i] Opening browser for authentication...
# [i] URL: https://accounts.google.com/o/oauth2/...
# [i] If browser doesn't open, copy the URL above
```

1. Copy the displayed URL
2. Open in your phone's browser (Chrome, Firefox, etc.)
3. Login and authorize
4. CCS will capture the callback automatically

#### Method 2: Using Termux:API

```bash
# Install Termux:API app from F-Droid first
pkg install termux-api

# Now OAuth URLs will open automatically
ccs gemini --auth
```

#### Method 3: SSH Tunnel (for remote auth)

```bash
# On Android (Termux)
sshd

# On PC
ssh -L 8085:localhost:8085 user@android-ip

# Now OAuth callbacks work through tunnel
```

### API Key Providers (GLM, Kimi)

```bash
# Open dashboard
ccs config

# Or set directly via environment
export GLM_API_KEY="your-api-key"
```

---

## Usage

### Basic Commands

```bash
# Default Claude session
ccs

# Specific providers
ccs gemini    # Google Gemini (OAuth)
ccs agy       # Antigravity (OAuth)
ccs glm       # GLM (API key)
ccs kimi      # Kimi (API key)
```

### Multi-Account

```bash
# Create work profile
ccs auth create work

# Use specific profile
ccs work "implement feature"
```

### Health Check

```bash
ccs doctor
```

---

## Remote Access

### SSH into Termux

```bash
# On Android (Termux)
pkg install openssh
passwd          # Set password
sshd            # Start SSH server
whoami          # Note username
ifconfig        # Note IP address

# On PC/Mac
ssh user@android-ip -p 8022
```

### VS Code Remote

1. Install "Remote - SSH" extension in VS Code
2. Connect to `user@android-ip:8022`
3. Open terminal and run `ccs`

### Persistent Sessions (tmux)

```bash
pkg install tmux

# Start new session
tmux new -s ccs

# Run CCS
ccs

# Detach: Ctrl+B, then D
# Reattach: tmux attach -t ccs
```

---

## Performance Tips

### Optimize Node.js

```bash
# Increase memory limit if needed
export NODE_OPTIONS="--max-old-space-size=512"
```

### Reduce Startup Time

```bash
# Use npm cache
npm config set cache ~/.npm-cache --global

# Clear old cache periodically
npm cache clean --force
```

### Battery Saving

```bash
# Acquire wake lock (prevent sleep)
termux-wake-lock

# Release when done
termux-wake-unlock
```

---

## Troubleshooting

### Common Errors

#### EBADPLATFORM Error
```
npm error notsup Unsupported platform for @kaitranntt/ccs
```
**Solution:** Use `@zesbe/ccs-android` or add `--force` flag

#### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8085
```
**Solution:**
```bash
ccs doctor
# Or manually kill and restart
pkill -f "node.*ccs" && ccs config
```

#### Permission Denied
```
EACCES: permission denied
```
**Solution:**
```bash
chmod -R 755 ~/.ccs
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### OAuth Callback Fails
**Solution:**
1. Ensure port 8085 is free: `lsof -i :8085`
2. Try different port: `CCS_PROXY_PORT=9000 ccs agy --auth`
3. Manual token extraction (last resort)

### Debug Mode

```bash
# Enable verbose logging
DEBUG=ccs:* ccs config

# Check logs
cat ~/.ccs/logs/ccs.log
```

### Reset Everything

```bash
# Nuclear option - fresh start
rm -rf ~/.ccs
npm uninstall -g @zesbe/ccs-android
npm install -g @zesbe/ccs-android
ccs config
```

---

## Known Limitations

| Limitation | Workaround |
|------------|------------|
| No GUI browser | Manual OAuth URL copy |
| Limited RAM | Reduce concurrent sessions |
| ARM binaries | Most deps work, some may fail |
| Background restrictions | Use `termux-wake-lock` |
| No system notifications | Use `termux-notification` |

### Unsupported Features

- Dashboard auto-open in browser (use manual URL)
- Native system tray integration
- Auto-update checks (manual update required)

---

## FAQ

### Q: Is this official?
A: No, this is a community fork. The original CCS is at [kaitranntt/ccs](https://github.com/kaitranntt/ccs).

### Q: Will my settings sync?
A: Settings are local to each device. Use git to sync `~/.ccs/config.yaml` if needed.

### Q: Can I run multiple instances?
A: Yes, but ensure each uses a different port:
```bash
CCS_PORT=3001 ccs config &
CCS_PORT=3002 ccs config &
```

### Q: How do I update?
A:
```bash
npm update -g @zesbe/ccs-android
```

### Q: It's slow, what can I do?
A:
1. Close other apps
2. Use a faster storage location
3. Reduce animation settings
4. Consider using proot-distro with Debian

---

## Contributing

Found a bug or have a suggestion for Android support?

1. Open an issue at [zesbe/ccs-android-support](https://github.com/zesbe/ccs-android-support/issues)
2. Include your device info, Android version, and Termux version
3. Provide reproduction steps

---

## Credits

- Original CCS by [Kai Tran](https://github.com/kaitranntt)
- Android support fork by [zesbe](https://github.com/zesbe)
- Termux by [termux](https://github.com/termux)

---

<div align="center">

**[Back to README](README.md)** | **[Original CCS Docs](https://docs.ccs.kaitran.ca)**

</div>
