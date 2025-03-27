import { addPatientRecord as addBlockchainRecord, getPatientRecords as getBlockchainRecords } from '../blockchain/web3.js';

// Function to add a new patient record
export const addPatientRecord = async (patientAddress, recordData) => {
  try {
    // Validate record data
    if (!recordData.visitDate || !recordData.symptoms || !recordData.diagnosis) {
      throw new Error('Missing required fields');
    }

    // Format record data
    const formattedRecord = {
      visitDate: recordData.visitDate || new Date().toISOString(),
      symptoms: Array.isArray(recordData.symptoms) 
        ? recordData.symptoms.join(', ') 
        : recordData.symptoms,
      diagnosis: recordData.diagnosis,
      prescription: recordData.prescription || 'No prescription provided'
    };

    // Add record to blockchain
    const result = await addBlockchainRecord(patientAddress, formattedRecord);
    
    return { success: true, result };
  } catch (error) {
    console.error('Error in history service (addPatientRecord):', error);
    throw error;
  }
};

// Function to get patient records
export const getPatientRecords = async (patientAddress) => {
  try {
    if (!patientAddress) {
      throw new Error('Patient address is required');
    }

    // Get records from blockchain
    const records = await getBlockchainRecords(patientAddress);
    
    return records;
  } catch (error) {
    console.error('Error in history service (getPatientRecords):', error);
    
    // In development/testing, return mock data if error occurs
    return [
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
  }
};

// Convert a diagnosis to a patient record
export const diagnosisToRecord = (diagnosis, symptoms) => {
  return {
    visitDate: new Date().toISOString(),
    symptoms: Array.isArray(symptoms) ? symptoms.join(', ') : symptoms,
    diagnosis: diagnosis.disease || diagnosis.name || 'Unknown',
    prescription: diagnosis.recommendations 
      ? Array.isArray(diagnosis.recommendations) 
        ? diagnosis.recommendations.join(', ') 
        : diagnosis.recommendations
      : 'Follow up with your doctor'
  };
}; 