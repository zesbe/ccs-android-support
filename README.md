<div align="center">

# CCS Android Support

![CCS Logo](assets/ccs-logo-medium.png)

### CCS with Native Android/Termux Support
Run Claude, Gemini, GLM, and any Anthropic-compatible API on your Android device - concurrently, without conflicts.

[![License](https://img.shields.io/badge/license-MIT-C15F3C?style=for-the-badge)](LICENSE)
[![npm](https://img.shields.io/npm/v/@zesbe/ccs-android?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@zesbe/ccs-android)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Termux-3DDC84?style=for-the-badge&logo=android)](https://termux.dev)

**[Original CCS](https://ccs.kaitran.ca)** | **[Android Guide](ANDROID.md)** | **[Upstream Docs](https://docs.ccs.kaitran.ca)**

</div>

<br>

## The Three Pillars

| Capability | What It Does | Manage Via |
|------------|--------------|------------|
| **Multiple Claude Accounts** | Run work + personal Claude subs simultaneously | Dashboard |
| **OAuth Providers** | Gemini, Codex, Antigravity - zero API keys needed | Dashboard |
| **API Profiles** | GLM, Kimi, or any Anthropic-compatible API | Dashboard |

<br>

## Quick Start

### 1. Install

```bash
npm install -g @kaitranntt/ccs
```

<details>
<summary>Alternative package managers</summary>

```bash
yarn global add @kaitranntt/ccs    # yarn
pnpm add -g @kaitranntt/ccs        # pnpm (70% less disk space)
bun add -g @kaitranntt/ccs         # bun (30x faster)
```

</details>

### 2. Open Dashboard

```bash
ccs config
# Opens http://localhost:3000
```

### 3. Configure Your Accounts

The dashboard provides visual management for all account types:

- **Claude Accounts**: Create isolated instances (work, personal, client)
- **OAuth Providers**: One-click auth for Gemini, Codex, Antigravity
- **API Profiles**: Configure GLM, Kimi with your keys
- **Health Monitor**: Real-time status across all profiles

**Analytics (Light/Dark Theme)**

![Analytics Light](assets/screenshots/analytics-light.png)

![Analytics Dark](assets/screenshots/analytics.png)

**API Profiles & OAuth Providers**

![API Profiles](assets/screenshots/api_profiles.png)

![CLIProxy](assets/screenshots/cliproxy.png)

<br>

## Built-in Providers

| Provider | Auth Type | Command | Best For |
|----------|-----------|---------|----------|
| **Claude** | Subscription | `ccs` | Default, strategic planning |
| **Gemini** | OAuth | `ccs gemini` | Zero-config, fast iteration |
| **Codex** | OAuth | `ccs codex` | Code generation |
| **Antigravity** | OAuth | `ccs agy` | Alternative routing |
| **GLM** | API Key | `ccs glm` | Cost-optimized execution |
| **Kimi** | API Key | `ccs kimi` | Long-context, thinking mode |

> **OAuth providers** authenticate via browser on first run. Tokens are cached in `~/.ccs/cliproxy/auth/`.

> [!TIP]
> **Need more?** CCS supports **any Anthropic-compatible API**. Create custom profiles for self-hosted LLMs, enterprise gateways, or alternative providers. See [API Profiles documentation](https://docs.ccs.kaitran.ca/providers/api-profiles).

<br>

## Usage

### Basic Commands

```bash
ccs           # Default Claude session
ccs agy       # Antigravity (OAuth)
ccs gemini    # Gemini (OAuth)
ccs glm       # GLM (API key)
```

### Parallel Workflows

Run multiple terminals with different providers:

```bash
# Terminal 1: Planning (Claude Pro)
ccs work "design the authentication system"

# Terminal 2: Execution (GLM - cost optimized)
ccs glm "implement the user service from the plan"

# Terminal 3: Review (Gemini)
ccs gemini "review the implementation for security issues"
```

### Multi-Account Claude

Create isolated Claude instances for work/personal separation:

```bash
ccs auth create work

# Run concurrently in separate terminals
ccs work "implement feature"    # Terminal 1
ccs  "review code"              # Terminal 2 (personal account)
```

<br>

## Maintenance

### Health Check

```bash
ccs doctor
```

Verifies: Claude CLI, config files, symlinks, permissions.

### Update

```bash
ccs update              # Update to latest
ccs update --force      # Force reinstall
ccs update --beta       # Install dev channel
```

### Sync Shared Items

```bash
ccs sync
```

Re-creates symlinks for shared commands, skills, and settings.

<br>

## Configuration

CCS auto-creates config on install. Dashboard is the recommended way to manage settings.

**Config location**: `~/.ccs/config.yaml`

<details>
<summary>Custom Claude CLI path</summary>

If Claude CLI is installed in a non-standard location:

```bash
export CCS_CLAUDE_PATH="/path/to/claude"              # Unix
$env:CCS_CLAUDE_PATH = "D:\Tools\Claude\claude.exe"   # Windows
```

</details>

<details>
<summary>Windows symlink support</summary>

Enable Developer Mode for true symlinks:

1. **Settings** → **Privacy & Security** → **For developers**
2. Enable **Developer Mode**
3. Reinstall: `npm install -g @kaitranntt/ccs`

Without Developer Mode, CCS falls back to copying directories.

</details>

## Android/Termux Support

> **This fork adds native Android platform support to CCS!**

### Why This Fork?

The original CCS package declares support only for `darwin`, `linux`, and `win32`. This fork adds `android` to the supported platforms, allowing direct installation on Termux without workarounds.

### Quick Install (Android/Termux)

```bash
# Install directly - no --force needed!
npm install -g @zesbe/ccs-android

# Or use original package with --force
npm install -g @kaitranntt/ccs --force
```

### Prerequisites

1. **Install Termux** from [F-Droid](https://f-droid.org/packages/com.termux/) (Google Play version is outdated)

2. **Setup Termux environment:**
   ```bash
   pkg update && pkg upgrade
   pkg install nodejs git
   ```

3. **(Optional) For proot-distro:**
   ```bash
   pkg install proot-distro
   proot-distro install debian
   ```

### Authentication Methods

Since Termux is headless (no browser), use one of these methods:

**Method 1: Manual URL Copy**
```bash
ccs <provider> --auth   # e.g., ccs agy --auth
# Copy the displayed URL to your phone browser
# Login and authorize
```

**Method 2: Termux:API (if installed)**
```bash
pkg install termux-api
# CCS will auto-open URLs via termux-open-url
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `EBADPLATFORM` error | Use `@zesbe/ccs-android` or add `--force` |
| `Connection refused` | Run `ccs doctor` to diagnose |
| Port 8085 blocked | `ccs doctor` will attempt auto-fix |
| OAuth callback fails | Manually copy auth token from browser |

```bash
# Run diagnostics
ccs doctor

# Reset configuration
rm -rf ~/.ccs && ccs config
```

### Full Android Documentation

See **[ANDROID.md](ANDROID.md)** for comprehensive Android/Termux guide including:
- Detailed setup instructions
- SSH remote access setup
- Performance optimization
- Known limitations
- Workarounds for common issues

<br>

## Documentation

| Topic | Link |
|-------|------|
| Installation | [docs.ccs.kaitran.ca/getting-started/installation](https://docs.ccs.kaitran.ca/getting-started/installation) |
| Configuration | [docs.ccs.kaitran.ca/getting-started/configuration](https://docs.ccs.kaitran.ca/getting-started/configuration) |
| OAuth Providers | [docs.ccs.kaitran.ca/providers/oauth-providers](https://docs.ccs.kaitran.ca/providers/oauth-providers) |
| Multi-Account Claude | [docs.ccs.kaitran.ca/providers/claude-accounts](https://docs.ccs.kaitran.ca/providers/claude-accounts) |
| API Profiles | [docs.ccs.kaitran.ca/providers/api-profiles](https://docs.ccs.kaitran.ca/providers/api-profiles) |
| CLI Reference | [docs.ccs.kaitran.ca/reference/cli-commands](https://docs.ccs.kaitran.ca/reference/cli-commands) |
| Architecture | [docs.ccs.kaitran.ca/reference/architecture](https://docs.ccs.kaitran.ca/reference/architecture) |
| Troubleshooting | [docs.ccs.kaitran.ca/reference/troubleshooting](https://docs.ccs.kaitran.ca/reference/troubleshooting) |

<br>

## Uninstall

```bash
npm uninstall -g @kaitranntt/ccs
```

<details>
<summary>Alternative package managers</summary>

```bash
yarn global remove @kaitranntt/ccs
pnpm remove -g @kaitranntt/ccs
bun remove -g @kaitranntt/ccs
```

</details>

<br>

## Philosophy

- **YAGNI**: No features "just in case"
- **KISS**: Simple, focused implementation
- **DRY**: One source of truth (config)

<br>

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

<br>

## License

MIT License - see [LICENSE](LICENSE).

<div align="center">

---

**[Android Guide](ANDROID.md)** | **[Original CCS](https://ccs.kaitran.ca)** | [Report Issues](https://github.com/zesbe/ccs-android-support/issues) | [Star on GitHub](https://github.com/zesbe/ccs-android-support)

*This is a community fork adding Android/Termux support. For the original CCS, visit [kaitranntt/ccs](https://github.com/kaitranntt/ccs).*

</div>
