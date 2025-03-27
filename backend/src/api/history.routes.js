// backend/src/api/history.routes.js
import { Router } from 'express';
import { addPatientRecord, getPatientRecords, diagnosisToRecord } from '../services/history.service.js';
import { authMiddleware } from '../services/auth.service.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Route to get patient records
router.get('/records', async (req, res) => {
  try {
    const records = await getPatientRecords(req.user.address);
    res.json(records);
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ error: "Failed to fetch records from blockchain" });
  }
});

// Route to add a new record
router.post('/records', async (req, res) => {
  try {
    await addPatientRecord(req.user.address, req.body);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding patient record:', error);
    res.status(500).json({ error: "Failed to store record on blockchain" });
  }
});

// Route to convert a diagnosis to a record and store it
router.post('/from-diagnosis', async (req, res) => {
  try {
    const { diagnosis, symptoms } = req.body;
    
    if (!diagnosis) {
      return res.status(400).json({ error: "Diagnosis data is required" });
    }
    
    // Convert diagnosis to record format
    const record = diagnosisToRecord(diagnosis, symptoms);
    
    // Store record
    await addPatientRecord(req.user.address, record);
    
    res.status(201).json({ success: true, record });
  } catch (error) {
    console.error('Error storing diagnosis as record:', error);
    res.status(500).json({ error: "Failed to store diagnosis on blockchain" });
  }
});

export default router; 