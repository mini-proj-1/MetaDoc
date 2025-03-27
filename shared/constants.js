// shared/constants.js
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3002/api' 
  : '/api';

export const DIAGNOSIS_ENDPOINT = '/diagnose'; 