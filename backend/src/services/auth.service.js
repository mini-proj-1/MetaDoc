import crypto from 'crypto';

// Map to store user sessions
const sessions = new Map();

// Generate a session token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verify Ethereum signature (in production this would use eth_sign verification)
const verifySignature = (message, signature, address) => {
  // In production, this would verify the signature cryptographically
  // For development/demo purposes, we'll just return true
  console.log(`Mock verification of signature from address ${address}`);
  return true;
};

// Authenticate user with wallet
export const authenticateWallet = async (address, signature, message) => {
  try {
    // Verify the signature
    const isValid = verifySignature(message, signature, address);
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    // Generate a session token
    const token = generateToken();
    
    // Store the session
    sessions.set(token, {
      address,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    return { token, address };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Verify a session token
export const verifySession = (token) => {
  if (!token) {
    return null;
  }
  
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired
  if (session.expiresAt < new Date()) {
    sessions.delete(token);
    return null;
  }
  
  return session;
};

// Authentication middleware
export const authMiddleware = (req, res, next) => {
  try {
    // For development/demo, let's use header or query param
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    // If no token is provided but we have a wallet address in query, use that for development
    if (!token && req.query.address) {
      req.user = { address: req.query.address };
      return next();
    }
    
    // For development, if no authentication mechanism is provided, use a mock address
    if (!token) {
      req.user = { address: '0x1234567890123456789012345678901234567890' };
      return next();
    }
    
    const session = verifySession(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Attach user info to request
    req.user = { address: session.address };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}; 