import { useState } from 'react';

const SymptomForm = ({ onDiagnosis }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      // Split by commas and process each symptom
      const symptoms = symptomInput.split(',')
        .map(s => s.trim())
        .filter(s => s && !selectedSymptoms.includes(s));
      
      if (symptoms.length > 0) {
        setSelectedSymptoms([...selectedSymptoms, ...symptoms]);
        setSymptomInput('');
      }
    }
  };

  const handleRemoveSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSymptom();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Process any pending input
    if (symptomInput.trim()) {
      // Split by commas and process each symptom
      const symptoms = symptomInput.split(',')
        .map(s => s.trim())
        .filter(s => s);
      
      if (symptoms.length > 0) {
        const allSymptoms = [...selectedSymptoms, ...symptoms];
        onDiagnosis(allSymptoms);
        setSelectedSymptoms([]);
        setSymptomInput('');
        return;
      }
    }
    
    // If we have selected symptoms but no pending input
    if (selectedSymptoms.length > 0) {
      onDiagnosis(selectedSymptoms);
      setSelectedSymptoms([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="symptom-form">
      <div className="selected-symptoms">
        {selectedSymptoms.map(symptom => (
          <div key={symptom} className="symptom-tag">
            {symptom}
            <button 
              type="button" 
              className="remove-symptom" 
              onClick={() => handleRemoveSymptom(symptom)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="input-container">
        <input
          type="text"
          className="symptom-input"
          placeholder="Enter your symptoms, separated by commas"
          value={symptomInput}
          onChange={(e) => setSymptomInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          type="submit" 
          disabled={selectedSymptoms.length === 0 && !symptomInput.trim()}
        >
          Diagnose
        </button>
      </div>
    </form>
  );
};

export default SymptomForm; 