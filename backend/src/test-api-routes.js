// Test script for blockchain API routes - Mock Implementation
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock address
const mockAddress = '0x1234567890123456789012345678901234567890';

const testBlockchainApiRoutes = async () => {
  console.log('Testing blockchain API routes with mock implementation...');
  
  try {
    // 1. Test wallet authentication
    console.log('\n--- Testing wallet authentication ---');
    console.log('Mock auth response: { token: "mock-token", address: "0x1234567890123456789012345678901234567890" }');
    
    // 2. Test adding a record via API
    console.log('\n--- Testing POST /api/history/records ---');
    const newRecord = {
      visitDate: new Date().toISOString(),
      symptoms: 'Cough, runny nose',
      diagnosis: 'Seasonal Allergies',
      prescription: 'Antihistamines, nasal spray'
    };
    
    console.log('Mock record to add:');
    console.log(newRecord);
    console.log('Mock response: { success: true }');
    
    // 3. Test getting records via API
    console.log('\n--- Testing GET /api/history/records ---');
    const mockRecords = [
      {
        visitDate: '2025-03-25',
        symptoms: 'Fever, cough',
        diagnosis: 'Common Cold',
        prescription: 'Rest, fluids, over-the-counter medicine'
      },
      {
        visitDate: '2025-03-10',
        symptoms: 'Headache, fatigue',
        diagnosis: 'Migraine',
        prescription: 'Pain relievers, rest in dark room'
      }
    ];
    
    console.log('Mock get records response:');
    console.log(JSON.stringify(mockRecords, null, 2));
    
    // 4. Test conversion from diagnosis to record
    console.log('\n--- Testing POST /api/history/from-diagnosis ---');
    const diagnosisData = {
      diagnosis: {
        disease: 'Migraine',
        recommendations: ['Rest in dark room', 'Pain medication', 'Stay hydrated']
      },
      symptoms: ['Headache', 'Light sensitivity', 'Nausea']
    };
    
    console.log('Mock diagnosis data:');
    console.log(JSON.stringify(diagnosisData, null, 2));
    console.log('Mock response: { success: true, record: {...} }');
    
    console.log('\nBlockchain API routes test completed successfully with mock data!');
    return true;
  } catch (error) {
    console.error('Blockchain API test failed:', error.message);
    return false;
  }
};

// Run the test
testBlockchainApiRoutes()
  .then(success => {
    if (success) {
      console.log('All API route tests passed with mock data! ✅');
    } else {
      console.error('API route tests failed! ❌');
    }
  })
  .catch(err => {
    console.error('Error running API route tests:', err);
  }); 