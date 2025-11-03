# CCS Workflow Documentation

Workflow documentation for CCS v2.0.0 covering installation, runtime behavior, and troubleshooting.

---

## Architecture Overview

```
User Command: ccs [profile] [claude-args...]
         │
         ▼
┌─────────────────┐
│  ccs (wrapper)  │  ← Bash (Unix) or PowerShell (Windows)
└────────┬────────┘
         │
         ├─ 1. Read ~/.ccs/config.json
         ├─ 2. Lookup profile → settings file
         ├─ 3. Validate settings file exists
         │
         ▼
    ┌────────────────┐
    │ Profile System │
    └───────┬────────┘
            │
            ├─ default: ~/.claude/settings.json
            └─ glm: ~/.ccs/glm.settings.json
            │
            ▼
    ┌──────────────────┐
    │   Claude CLI     │
    └──────────────────┘
```

### Key Components

1. **ccs wrapper**: Lightweight script (bash/PowerShell)
2. **Config file**: `~/.ccs/config.json` (profile → settings mappings)
3. **Settings files**: Claude CLI settings JSON format
4. **Claude CLI**: Official Anthropic CLI (unchanged)

### Design Principles

- **YAGNI**: Only 2 profiles (default/glm)
- **KISS**: Simple delegation, no magic
- **DRY**: One source of truth (config.json)
- **Non-invasive**: Never modifies ~/.claude/settings.json

---

## Installation Workflow

### Process

1. **Create directories**: `~/.ccs/`, `~/.local/bin/`
2. **Install executables**:
   - Git mode: Symlink from repo
   - Standalone: Download from GitHub
3. **Install .claude folder**: Commands and skills
4. **Create config**: `config.json` if missing
5. **Create GLM profile**: `glm.settings.json` if missing
6. **Backup**: Single `config.json.backup` (overwrites)
7. **Validate**: Check JSON syntax

### Files Created

```
~/.ccs/
├── ccs                     # Main executable
├── config.json             # Profile mappings
├── config.json.backup      # Single backup (no timestamp)
├── glm.settings.json       # GLM profile
├── uninstall.sh            # Uninstaller
└── .claude/                # Claude Code integration
    ├── commands/ccs.md
    └── skills/ccs-delegation/
```

---

## Runtime Workflow

### Unix/Linux/macOS

```
ccs [profile] [args]
  ↓
Read config.json
  ↓
Lookup profile → settings file path
  ↓
Validate file exists
  ↓
exec claude --settings <path> [args]
```

### Windows

```
ccs [profile] [args]
  ↓
Read config.json
  ↓
Lookup profile → settings file path
  ↓
Validate file exists
  ↓
exec claude --settings <path> [args]
```

---

## Profile System

### Config Structure

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

### Settings File Format

**GLM Profile** (`~/.ccs/glm.settings.json`):
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your_api_key",
    "ANTHROPIC_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.6"
  }
}
```

**Claude (Default)** (`~/.claude/settings.json`):
- User-managed, CCS never modifies it
- Referenced by default profile

---

## Troubleshooting

### Profile Not Found

| Check | Fix |
|-------|-----|
| config.json exists? | Run installer |
| Valid JSON? | Fix syntax or restore from backup |
| Profile in config? | Add profile or use default/glm |
| Settings file exists? | Create from template |

### PowerShell Crash (Windows)

**Error**: `SetEnvironmentVariable` error

**Fix**:
1. Check settings format has `{"env": {...}}`
2. Ensure all values are strings (not booleans/objects)
3. Remove non-env fields from settings file

### Installation Issues

| Issue | Fix |
|-------|-----|
| 404 Not Found | Check installers exist in GitHub |
| Permission denied | Check ~/.ccs/ permissions |
| jq not found | Install jq: `brew install jq` (Unix) |
| PATH warning | Add `~/.local/bin` to PATH |

---

## Key Points

1. **Installation**: Creates 2 profiles (glm + default), validates JSON
2. **Runtime**: Simple delegation to Claude CLI via `--settings` flag
3. **Cross-platform**: Identical behavior on Unix/Linux/macOS/Windows
4. **Non-invasive**: Never touches `~/.claude/settings.json`
5. **Validation**: JSON syntax checking prevents errors
6. **Backup**: Single file, overwrites each install

---

**Version**: v2.0.0
**Updated**: 2025-11-02
