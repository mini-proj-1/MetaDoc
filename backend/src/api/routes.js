// backend/src/api/routes.js
import { Router } from 'express';
import { diagnose } from '../services/diagnosis.service.js';
import historyRoutes from './history.routes.js';
import { authenticateWallet } from '../services/auth.service.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Metaverse Doctor API is running' });
});

// Diagnosis route
router.post('/diagnose', diagnose);

// Wallet authentication route
router.post('/auth/wallet', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // For development purposes, we'll accept authentication without signature
    const authResult = await authenticateWallet(
      address, 
      signature || 'mock-signature', 
      message || 'mock-message'
    );
    
    res.json(authResult);
  } catch (error) {
    console.error('Wallet authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Mount history routes
router.use('/history', historyRoutes);

export function setupRoutes(app) {
  app.use('/api', router);
} 