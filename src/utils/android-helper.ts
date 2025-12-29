import { spawn, ChildProcess, SpawnOptions } from 'child_process';

/**
 * Spawn a command, wrapping it with proot-distro on Android if it's the CLIProxy binary
 */
export function spawnProxy(command: string, args: string[], options: SpawnOptions): ChildProcess {
  if (process.platform === 'android') {
    // Wrap with proot-distro login debian
    // We use -- to separate proot-distro args from the command
    const newCommand = 'proot-distro';
    const newArgs = ['login', 'debian', '--', command, ...args];
    
    // Ensure environment variables are passed correctly
    // proot-distro login usually preserves some env vars, but it's safer to be explicit if needed
    // However, the current spawn options already have env
    
    return spawn(newCommand, newArgs, options);
  }
  
  return spawn(command, args, options);
}
