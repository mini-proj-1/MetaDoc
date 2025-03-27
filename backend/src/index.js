import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config.js';
import { setupRoutes } from './api/routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  next();
});

// Setup routes
setupRoutes(app);

// Add response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    console.log(`${new Date().toISOString()} - Response for ${req.method} ${req.url}:`);
    console.log(body);
    originalSend.call(this, body);
  };
  
  next();
});

// Start server with better error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Attempting to use next available port: ${PORT + 1}`);
    
    // Try the next port
    const nextPort = PORT + 1;
    const newServer = app.listen(nextPort, () => {
      console.log(`Server running on http://localhost:${nextPort}`);
      console.log(`Note: Update frontend/src/App.jsx to use port ${nextPort} for API calls`);
    }).on('error', (err) => {
      console.error(`Could not start server on port ${nextPort}: ${err.message}`);
      console.error('Please close any applications using these ports and try again.');
      process.exit(1);
    });
  } else {
    console.error('Server error:', e);
    process.exit(1);
  }
}); 