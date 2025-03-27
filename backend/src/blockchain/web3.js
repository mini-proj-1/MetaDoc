import Web3 from 'web3';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to load contract ABI
const loadContractABI = async () => {
  try {
    // We'll create a simple mock ABI for now, with full implementation this would be generated from the contract
    const mockABI = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "patient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "RecordAdded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "provider",
            "type": "address"
          }
        ],
        "name": "ProviderAuthorized",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "provider",
            "type": "address"
          }
        ],
        "name": "ProviderRevoked",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "visitDate",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symptoms",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "diagnosis",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "prescription",
            "type": "string"
          }
        ],
        "name": "addRecord",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "patient",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "visitDate",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symptoms",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "diagnosis",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "prescription",
            "type": "string"
          }
        ],
        "name": "addRecordForPatient",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getRecords",
        "outputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "visitDate",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "symptoms",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "diagnosis",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "prescription",
                "type": "string"
              }
            ],
            "internalType": "struct PatientHistory.Record[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "patient",
            "type": "address"
          }
        ],
        "name": "getPatientRecords",
        "outputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "visitDate",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "symptoms",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "diagnosis",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "prescription",
                "type": "string"
              }
            ],
            "internalType": "struct PatientHistory.Record[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          }
        ],
        "name": "authorizeProvider",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          }
        ],
        "name": "revokeProvider",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          }
        ],
        "name": "isAuthorizedProvider",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    return mockABI;
  } catch (error) {
    console.error('Error loading contract ABI:', error);
    throw error;
  }
};

// Initialize Web3 connection
let web3;
let patientHistoryContract;

const initWeb3 = async () => {
  try {
    // For development/testing, always use the mock implementation
    console.log('Using mock Web3 implementation for development');
    web3 = {
      eth: {
        Contract: function(abi, address) {
          return {
            methods: {
              addRecord: (visitDate, symptoms, diagnosis, prescription) => ({
                send: async ({ from }) => {
                  console.log(`Mock: Adding record from ${from}`);
                  return { status: true, events: { RecordAdded: { returnValues: { patient: from, timestamp: Date.now() } } } };
                }
              }),
              addRecordForPatient: (patient, visitDate, symptoms, diagnosis, prescription) => ({
                send: async ({ from }) => {
                  console.log(`Mock: Admin ${from} adding record for patient ${patient}`);
                  return { status: true, events: { RecordAdded: { returnValues: { patient, timestamp: Date.now() } } } };
                }
              }),
              getRecords: () => ({
                call: async ({ from }) => {
                  console.log(`Mock: Getting records for ${from}`);
                  return getMockRecords(from);
                }
              }),
              getPatientRecords: (patientAddress) => ({
                call: async ({ from }) => {
                  console.log(`Mock: Provider ${from} getting records for ${patientAddress}`);
                  return getMockRecords(patientAddress);
                }
              }),
              authorizeProvider: (provider) => ({
                send: async ({ from }) => {
                  console.log(`Mock: Admin ${from} authorizing provider ${provider}`);
                  return { status: true, events: { ProviderAuthorized: { returnValues: { provider } } } };
                }
              }),
              revokeProvider: (provider) => ({
                send: async ({ from }) => {
                  console.log(`Mock: Admin ${from} revoking provider ${provider}`);
                  return { status: true, events: { ProviderRevoked: { returnValues: { provider } } } };
                }
              }),
              isAuthorizedProvider: (provider) => ({
                call: async () => {
                  console.log(`Mock: Checking if ${provider} is authorized`);
                  return true; // Always return true for testing
                }
              })
            }
          };
        },
        getAccounts: async () => ['0x1234567890123456789012345678901234567890']
      }
    };

    // Load contract ABI
    const contractABI = await loadContractABI();
    const contractAddress = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // Initialize contract instance
    patientHistoryContract = new web3.eth.Contract(contractABI, contractAddress);
    
    console.log('Web3 mock initialized successfully');
    return { web3, patientHistoryContract };
  } catch (error) {
    console.error('Error initializing Web3:', error);
    throw error;
  }
};

// Helper function to get mock records
const getMockRecords = (address) => {
  return [
    {
      visitDate: '2025-03-25T12:00:00.000Z',
      symptoms: 'Fever, cough',
      diagnosis: 'Common Cold',
      prescription: 'Rest, fluids, over-the-counter medicine'
    },
    {
      visitDate: '2025-03-10T15:30:00.000Z',
      symptoms: 'Headache, fatigue',
      diagnosis: 'Migraine',
      prescription: 'Pain relievers, rest in dark room'
    },
    {
      visitDate: new Date().toISOString(),
      symptoms: 'Sore throat, runny nose',
      diagnosis: 'Seasonal Allergies', 
      prescription: 'Antihistamines, nasal spray'
    }
  ];
};

// Export blockchain interaction functions
export const addPatientRecord = async (patientAddress, recordData) => {
  try {
    if (!web3 || !patientHistoryContract) {
      await initWeb3();
    }
    
    const { visitDate, symptoms, diagnosis, prescription } = recordData;
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    
    let result;
    
    // If the sender is the patient, use addRecord
    if (patientAddress === adminAccount) {
      console.log(`Patient adding their own record`);
      result = await patientHistoryContract.methods
        .addRecord(visitDate, symptoms, diagnosis, prescription)
        .send({ from: patientAddress });
    } 
    // Otherwise, use addRecordForPatient (admin or authorized provider)
    else {
      console.log(`Provider adding record for patient ${patientAddress}`);
      result = await patientHistoryContract.methods
        .addRecordForPatient(patientAddress, visitDate, symptoms, diagnosis, prescription)
        .send({ from: adminAccount });
    }
      
    return result;
  } catch (error) {
    console.error('Error adding patient record:', error);
    throw error;
  }
};

export const getPatientRecords = async (patientAddress) => {
  try {
    if (!web3 || !patientHistoryContract) {
      await initWeb3();
    }
    
    // In development, always return mock data
    console.log(`Mock: Getting records for ${patientAddress}`);
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
      },
      {
        visitDate: new Date().toISOString(),
        symptoms: 'Sore throat, runny nose',
        diagnosis: 'Seasonal Allergies', 
        prescription: 'Antihistamines, nasal spray'
      }
    ];
  } catch (error) {
    console.error('Error getting patient records:', error);
    
    // For development, return mock data if contract call fails
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

// Initialize on module load
initWeb3().catch(console.error); 