// Test script for blockchain integration
import { addPatientRecord, getPatientRecords } from './blockchain/web3.js';

const mockPatientAddress = '0x1234567890123456789012345678901234567890';
const mockProviderAddress = '0x2345678901234567890123456789012345678901';

const testBlockchainIntegration = async () => {
  console.log('Testing blockchain integration...');
  
  try {
    // 1. Test adding a record as a patient
    console.log('\n--- Testing addRecord (patient adding own record) ---');
    const mockRecord = {
      visitDate: new Date().toISOString(),
      symptoms: 'Fever, headache, fatigue',
      diagnosis: 'Common Cold',
      prescription: 'Rest, fluids, over-the-counter pain relievers'
    };
    
    console.log(`Adding record for patient self-entry ${mockPatientAddress}:`);
    console.log(mockRecord);
    
    const addResult = await addPatientRecord(mockPatientAddress, mockRecord);
    console.log('Result:', addResult);
    
    // 2. Test adding a record as a provider for a patient
    console.log('\n--- Testing addRecordForPatient (provider adding for patient) ---');
    const mockRecord2 = {
      visitDate: new Date().toISOString(),
      symptoms: 'Rash, itching',
      diagnosis: 'Contact Dermatitis',
      prescription: 'Topical hydrocortisone, avoid allergens'
    };
    
    console.log(`Adding record for patient ${mockPatientAddress} by provider:`);
    console.log(mockRecord2);
    
    // Using different patient address to trigger the addRecordForPatient path
    const addProviderResult = await addPatientRecord(mockProviderAddress, mockRecord2);
    console.log('Provider Result:', addProviderResult);
    
    // 3. Test retrieving patient records
    console.log('\n--- Testing getRecords (patient view) ---');
    console.log(`Getting records for patient ${mockPatientAddress}`);
    
    const records = await getPatientRecords(mockPatientAddress);
    console.log('Retrieved records:');
    console.log(JSON.stringify(records, null, 2));
    
    // 4. Test retrieving patient records as a provider
    console.log('\n--- Testing getPatientRecords (provider view) ---');
    console.log(`Provider getting records for patient ${mockProviderAddress}`);
    
    const providerRecords = await getPatientRecords(mockProviderAddress);
    console.log('Provider retrieved records:');
    console.log(JSON.stringify(providerRecords, null, 2));
    
    console.log('\nBlockchain integration test completed successfully!');
    return true;
  } catch (error) {
    console.error('Blockchain integration test failed:', error);
    return false;
  }
};

// Run the test
testBlockchainIntegration()
  .then(success => {
    if (success) {
      console.log('All blockchain tests passed! ✅');
    } else {
      console.error('Blockchain tests failed! ❌');
    }
  })
  .catch(err => {
    console.error('Error running blockchain tests:', err);
  }); 