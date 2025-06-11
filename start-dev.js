import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start the API server
const apiServer = spawn('npx', ['tsx', 'server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
});

// Start Vite development server for frontend
const viteServer = spawn('npx', ['vite', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit'
});

// Handle process cleanup
process.on('SIGINT', () => {
  apiServer.kill();
  viteServer.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  apiServer.kill();
  viteServer.kill();
  process.exit();
});

console.log('Starting development servers...');
console.log('API Server: http://localhost:3000');
console.log('Frontend: http://localhost:5173');