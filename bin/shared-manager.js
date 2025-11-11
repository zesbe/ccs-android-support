'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * SharedManager - Manages symlinked shared directories for CCS
 * Phase 1: Shared Global Data via Symlinks
 *
 * Purpose: Eliminates duplication of commands/skills across profile instances
 * by symlinking to a single ~/.ccs/shared/ directory.
 */
class SharedManager {
  constructor() {
    this.homeDir = os.homedir();
    this.sharedDir = path.join(this.homeDir, '.ccs', 'shared');
    this.instancesDir = path.join(this.homeDir, '.ccs', 'instances');
    this.sharedDirs = ['commands', 'skills', 'agents'];
  }

  /**
   * Ensure shared directories exist
   */
  ensureSharedDirectories() {
    // Create shared directory
    if (!fs.existsSync(this.sharedDir)) {
      fs.mkdirSync(this.sharedDir, { recursive: true, mode: 0o700 });
    }

    // Create shared subdirectories
    for (const dir of this.sharedDirs) {
      const dirPath = path.join(this.sharedDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
      }
    }
  }

  /**
   * Link shared directories to instance
   * @param {string} instancePath - Path to instance directory
   */
  linkSharedDirectories(instancePath) {
    this.ensureSharedDirectories();

    for (const dir of this.sharedDirs) {
      const linkPath = path.join(instancePath, dir);
      const targetPath = path.join(this.sharedDir, dir);

      // Remove existing directory/link
      if (fs.existsSync(linkPath)) {
        fs.rmSync(linkPath, { recursive: true, force: true });
      }

      // Create symlink
      try {
        fs.symlinkSync(targetPath, linkPath, 'dir');
      } catch (err) {
        // Windows fallback: copy directory if symlink fails
        if (process.platform === 'win32') {
          this._copyDirectory(targetPath, linkPath);
          console.log(`[!] Symlink failed for ${dir}, copied instead (enable Developer Mode)`);
        } else {
          throw err;
        }
      }
    }
  }

  /**
   * Check if migration is needed
   * @returns {boolean}
   * @private
   */
  _needsMigration() {
    // If shared dir doesn't exist, migration needed
    if (!fs.existsSync(this.sharedDir)) {
      return true;
    }

    // Check if ALL shared directories are empty
    const allEmpty = this.sharedDirs.every(dir => {
      const dirPath = path.join(this.sharedDir, dir);
      if (!fs.existsSync(dirPath)) return true;
      try {
        const files = fs.readdirSync(dirPath);
        return files.length === 0;
      } catch (err) {
        return true; // If can't read, assume empty
      }
    });

    return allEmpty;
  }

  /**
   * Perform migration from ~/.claude/ to ~/.ccs/shared/
   * @returns {object} { commands: N, skills: N, agents: N }
   * @private
   */
  _performMigration() {
    const stats = { commands: 0, skills: 0, agents: 0 };
    const claudeDir = path.join(this.homeDir, '.claude');

    if (!fs.existsSync(claudeDir)) {
      return stats; // No content to migrate
    }

    // Migrate commands
    const commandsPath = path.join(claudeDir, 'commands');
    if (fs.existsSync(commandsPath)) {
      const result = this._copyDirectory(commandsPath, path.join(this.sharedDir, 'commands'));
      stats.commands = result.copied;
    }

    // Migrate skills
    const skillsPath = path.join(claudeDir, 'skills');
    if (fs.existsSync(skillsPath)) {
      const result = this._copyDirectory(skillsPath, path.join(this.sharedDir, 'skills'));
      stats.skills = result.copied;
    }

    // Migrate agents
    const agentsPath = path.join(claudeDir, 'agents');
    if (fs.existsSync(agentsPath)) {
      const result = this._copyDirectory(agentsPath, path.join(this.sharedDir, 'agents'));
      stats.agents = result.copied;
    }

    return stats;
  }

  /**
   * Migrate existing instances to shared structure
   * Idempotent: Safe to run multiple times
   */
  migrateToSharedStructure() {
    console.log('[i] Checking for content migration...');

    // Check if migration is needed
    if (!this._needsMigration()) {
      console.log('[OK] Migration not needed (shared dirs have content)');
      return;
    }

    console.log('[i] Migrating ~/.claude/ content to ~/.ccs/shared/...');

    // Create shared directories
    this.ensureSharedDirectories();

    // Perform migration
    const stats = this._performMigration();

    // Show results
    const total = stats.commands + stats.skills + stats.agents;
    if (total === 0) {
      console.log('[OK] No content to migrate (empty ~/.claude/)');
    } else {
      const parts = [];
      if (stats.commands > 0) parts.push(`${stats.commands} commands`);
      if (stats.skills > 0) parts.push(`${stats.skills} skills`);
      if (stats.agents > 0) parts.push(`${stats.agents} agents`);
      console.log(`[OK] Migrated ${parts.join(', ')}`);
    }

    // Update all instances to use symlinks
    if (fs.existsSync(this.instancesDir)) {
      const instances = fs.readdirSync(this.instancesDir);

      for (const instance of instances) {
        const instancePath = path.join(this.instancesDir, instance);
        if (fs.statSync(instancePath).isDirectory()) {
          this.linkSharedDirectories(instancePath);
        }
      }
    }
  }

  /**
   * Copy directory recursively (SAFE: preserves existing files)
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   * @returns {object} { copied: N, skipped: N }
   * @private
   */
  _copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
      return { copied: 0, skipped: 0 };
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    let copied = 0;
    let skipped = 0;

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // SAFETY: Skip if destination exists (preserve user modifications)
      if (fs.existsSync(destPath)) {
        skipped++;
        continue;
      }

      if (entry.isDirectory()) {
        const stats = this._copyDirectory(srcPath, destPath);
        copied += stats.copied;
        skipped += stats.skipped;
      } else {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }

    return { copied, skipped };
  }
}

module.exports = SharedManager;
