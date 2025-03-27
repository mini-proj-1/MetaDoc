// backend/src/config/config.js
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',
  diseaseAPI: process.env.DISEASE_API || 'https://disease-pred-svm.onrender.com/predict',
  apiTimeout: parseInt(process.env.API_TIMEOUT) || 15000
}; 