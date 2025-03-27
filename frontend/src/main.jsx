import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';

// Log environment variables for debugging
console.log('=== Metaverse Doctor Frontend Environment ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:3001');
console.log('Running on port:', process.env.PORT || '3000 (default)');
console.log('Window location:', window.location.href);
console.log('==========================================');

// Check browser network connectivity
try {
  fetch('http://localhost:3001/api/health', { 
    method: 'GET',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => {
    console.log('Backend health check response:', response.status);
    return response.json();
  })
  .then(data => console.log('Backend health data:', data))
  .catch(err => console.error('Backend health check failed:', err));
} catch (error) {
  console.error('Error checking backend connectivity:', error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
); 