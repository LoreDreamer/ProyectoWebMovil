import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const processes = [];
let shuttingDown = false;

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function prefixOutput(stream, label, color) {
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    console.log(`${color}[${label}]${colors.reset} ${line}`);
  });
}

function startProcess(label, color, cwd, command, args) {
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false
  });

  processes.push({ label, child });

  prefixOutput(child.stdout, label, color);
  prefixOutput(child.stderr, label, color);

  child.on('error', (error) => {
    if (!shuttingDown) {
      console.error(`${colors.red}[${label}] Error al iniciar:${colors.reset}`, error.message);
      shutdown(1);
    }
  });

  child.on('exit', (code) => {
    if (shuttingDown) return;

    if (code !== 0) {
      console.error(`${colors.red}[${label}] Proceso terminado con código ${code}.${colors.reset}`);
      shutdown(code || 1);
      return;
    }

    console.log(`${colors.yellow}[${label}] Proceso finalizado.${colors.reset}`);
    shutdown(0);
  });

  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('');
  console.log(`${colors.yellow}Cerrando frontend y backend...${colors.reset}`);

  for (const { child } of processes) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => {
    for (const { child } of processes) {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }

    process.exit(exitCode);
  }, 800);
}

function setupKeyboardShortcuts() {
  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.resume();

  process.stdin.on('keypress', (str, key) => {
    const isCtrlC = key.ctrl && key.name === 'c';
    const isQ = key.name === 'q';

    if (isCtrlC || isQ) {
      shutdown(0);
    }
  });
}

process.on('SIGINT', () => {
  shutdown(0);
});

process.on('SIGTERM', () => {
  shutdown(0);
});

console.log(`${colors.cyan}Iniciando frontend y backend...${colors.reset}`);
console.log(`${colors.yellow}Presiona \n- Ctrl + C o q \npara cerrar todo.${colors.reset}`);
console.log('');

setupKeyboardShortcuts();

startProcess(
  'FRONTEND',
  colors.cyan,
  path.join(rootDir, 'frontend'),
  process.execPath,
  [
    path.join(rootDir, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js'),
    '--port',
    '5173',
    '--strictPort'
  ]
);

startProcess(
  'BACKEND',
  colors.green,
  path.join(rootDir, 'backend'),
  process.execPath,
  [
    path.join(rootDir, 'backend', 'node_modules', 'tsx', 'dist', 'cli.mjs'),
    'watch',
    'server.ts'
  ]
);