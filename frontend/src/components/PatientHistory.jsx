import { useState, useEffect } from 'react';
import axios from 'axios';

const PatientHistory = ({ patientAddress }) => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Use a mock address for development if none provided
                const address = patientAddress || '0x1234567890123456789012345678901234567890';
                
                // Determine the correct API endpoint
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                
                const response = await axios.get(`${API_URL}/api/history/records`, {
                    params: { address }
                });
                
                setRecords(response.data);
            } catch (error) {
                console.error("Error fetching records:", error);
                setError("Failed to load medical history. Please try again later.");
                
                // For development, provide mock data if API call fails
                setRecords([
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
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchRecords();
    }, [patientAddress]);

    // Format the date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    return (
        <div className="history-container">
            <h3>Medical History</h3>
            <p className="history-subtitle">Securely stored on blockchain</p>
            
            {isLoading ? (
                <div className="loading-indicator">
                    <p>Loading records from blockchain...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            ) : records.length === 0 ? (
                <div className="no-records">
                    <p>No medical records found.</p>
                </div>
            ) : (
                <ul className="history-list">
                    {records.map((record, index) => (
                        <li key={index} className="history-item">
                            <div className="history-date">
                                <strong>Visit Date:</strong> {formatDate(record.visitDate)}
                            </div>
                            <div className="history-content">
                                <p><strong>Symptoms:</strong> {record.symptoms}</p>
                                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                <p><strong>Prescription:</strong> {record.prescription}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PatientHistory; 