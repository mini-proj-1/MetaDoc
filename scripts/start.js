// This script starts both the frontend and backend servers
// Uses cross-spawn to work cross-platform
const spawn = require('cross-spawn');
const path = require('path');

console.log('Starting Metaverse Doctor servers...');

// Start backend server
const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../backend'),
  stdio: 'inherit'
});

// Start frontend server
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../frontend'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backendProcess.kill('SIGINT');
  frontendProcess.kill('SIGINT');
  process.exit();
});

console.log(`
✅ Servers started:
- Backend: http://localhost:3002
- Frontend: http://localhost:3001 (or another port if 3001 is in use)

Press Ctrl+C to stop both servers.
`); 