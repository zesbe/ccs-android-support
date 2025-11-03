# Changelog

All notable changes to CCS will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [2.1.0] - 2025-11-02

### Changed
- **MAJOR SIMPLIFICATION**: Windows PowerShell now uses `--settings` flag (confirmed working in Claude CLI 2.0.31+)
- Removed 64 lines of environment variable management code from ccs.ps1
- Windows and Unix/Linux/macOS now use identical approach
- Updated all documentation to reflect cross-platform consistency
- ccs.ps1: 235 lines → 171 lines (27% reduction)

### Technical Details
- Windows Claude CLI DOES support `--settings` flag (contrary to previous assumptions)
- No longer manually sets/restores environment variables
- Simpler, cleaner, more maintainable codebase
- Settings file format unchanged (still uses `{"env": {...}}` structure)

## [2.0.0] - 2025-11-02

### BREAKING CHANGES
- Removed `ccs son` profile - use `ccs` (default) for Claude subscription
- Config structure simplified - `sonnet` profile removed from default config

### Added
- `config/` folder with organized templates (base-glm, base-dsp, config.example)
- `config/README.md` - comprehensive config documentation
- `installers/` folder for clean project structure (install/uninstall scripts)
- Smart installer with validation and self-healing
- Non-invasive approach - never modifies `~/.claude/settings.json`
- Version pinning support: `curl ccs.kaitran.ca/v2.0.0/install | bash`
- CHANGELOG.md for release tracking
- WORKFLOW.md - comprehensive workflow documentation
- Migration detection and auto-migration from v1.x configs
- Config backup before modifications with timestamp
- JSON validation for all config files
- GitHub Actions workflow for auto-deploying CloudFlare Worker
- VERSION file for centralized version management

### Fixed
- **CRITICAL**: PowerShell env var bug - strict filtering prevents crashes on non-string values
- PowerShell now requires `env` object in settings files (prevents crashes on root-level fields)
- Type validation for environment variables (strings only)
- Installer now validates all JSON before processing
- Better error messages with actionable solutions

### Changed
- `ccs` now default behavior (uses Claude subscription, no profile needed)
- Simplified profile management (glm fallback only)
- Moved `.ccs.example.json` → `config/config.example.json`
- Reorganized project: install/uninstall scripts → `installers/` folder
- Enhanced error messages with solutions and reinstall instructions
- Removed sonnet profile creation from installers
- Config structure: `{ "glm": "...", "default": "~/.claude/settings.json" }`
- Worker.js routing updated for new installers/ path

### Migration Guide
- Old users: `ccs son` → `ccs` (automatic deprecation warning during install)
- Config auto-migrates during installation (son/sonnet profiles removed)
- GLM API keys preserved during upgrade
- Backup created automatically: `~/.ccs/config.json.backup.TIMESTAMP`
- No action needed unless you customized `sonnet` profile

## [1.1.0] - 2025-11-01

### Added
- Support for git worktrees and submodules
- Enhanced GLM profile with default model variables
- Improved installer detection logic

### Fixed
- BASH_SOURCE unbound variable error in installer
- Git worktree detection

## [1.0.0] - 2025-10-31

### Added
- Initial release
- Profile-based switching between Claude and GLM
- Cross-platform support (macOS, Linux, Windows)
- One-line installation
- Auto-detection of current provider
