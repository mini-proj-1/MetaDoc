import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix
  const env = loadEnv(mode, process.cwd(), '');
  
  // Also check for env in frontend directory
  const frontendEnvPath = path.resolve(process.cwd(), 'frontend', '.env');
  let frontendEnvVars = {};
  
  if (fs.existsSync(frontendEnvPath)) {
    const content = fs.readFileSync(frontendEnvPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          frontendEnvVars[key.trim()] = value.trim();
        }
      }
    });
  }
  
  // Combine env variables, prioritizing frontend .env
  const combinedEnv = { ...env, ...frontendEnvVars };
  
  // Explicitly set port to 5173 to avoid conflicts
  const port = 5173;
  const apiUrl = combinedEnv.REACT_APP_API_URL || 'http://localhost:3001';
  
  console.log('Starting frontend with:');
  console.log(`- Port: ${port}`);
  console.log(`- API URL: ${apiUrl}`);
  
  return {
    plugins: [react()],
    server: {
      port: port,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      'process.env': {
        ...combinedEnv,
        NODE_ENV: mode,
        PORT: port.toString()
      }
    }
  };
}); 