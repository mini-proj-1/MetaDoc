import { useState, useCallback } from 'react';
import ChatBot from 'react-simple-chatbot';
import axios from 'axios';

// Backend API URL - Using proxy
const API_URL = '';

// API service that ensures only one call per session
class DiagnosisService {
  static instance = null;
  static diagnosisCache = new Map();
  
  static getInstance() {
    if (!DiagnosisService.instance) {
      DiagnosisService.instance = new DiagnosisService();
    }
    return DiagnosisService.instance;
  }
  
  getDiagnosis(symptoms) {
    // Convert to string for cache key
    const symptomsKey = Array.isArray(symptoms) ? symptoms.join(' ') : symptoms;
    
    // Check cache first
    if (DiagnosisService.diagnosisCache.has(symptomsKey)) {
      console.log('Using cached diagnosis for:', symptomsKey);
      return Promise.resolve(DiagnosisService.diagnosisCache.get(symptomsKey));
    }
    
    console.log('Making a new API call for:', symptomsKey);
    
    // Make API call
    return axios.post(`/api/diagnose`, { symptoms }, {
      timeout: 10000
    })
      .then(response => {
        const diagnosis = response.data;
        // Cache the result
        DiagnosisService.diagnosisCache.set(symptomsKey, diagnosis);
        return diagnosis;
      })
      .catch(error => {
        console.error('Error getting diagnosis:', error);
        
        // Return a fallback diagnosis
        const fallback = {
          condition: 'Virtual Fatigue Syndrome',
          severity: 'mild',
          recommendations: [
            'Take a 30-minute break from the metaverse',
            'Perform physical stretching',
            'Adjust your avatar settings for comfort'
          ],
          usedFallback: true
        };
        
        DiagnosisService.diagnosisCache.set(symptomsKey, fallback);
        return fallback;
      });
  }
}

const DiagnosisDisplay = ({ condition, severity, recommendations }) => {
  // Color based on severity
  const getSeverityColor = () => {
    const severityLower = severity?.toLowerCase() || '';
    if (severityLower.includes('high')) return '#f44336'; // Red for high
    if (severityLower.includes('medium')) return '#ff9800'; // Orange for medium
    if (severityLower.includes('low')) return '#4caf50'; // Green for low
    return '#9c27b0'; // Purple for default/unknown
  };

  return (
    <div className="diagnosis-display">
      <div className="diagnosis-card">
        <div className="diagnosis-header">
          <div className="diagnosis-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill={getSeverityColor()} d="M10.5,2C9.12,2 8,3.12 8,4.5V6H4.5C3.12,6 2,7.12 2,8.5V20.5C2,21.88 3.12,23 4.5,23H16.5C17.88,23 19,21.88 19,20.5V17H20.5C21.88,17 23,15.88 23,14.5V7.5C23,5.29 21.21,3.5 19,3.5H16V4.5C16,5.88 14.88,7 13.5,7H10.5C9.12,7 8,5.88 8,4.5V2H10.5M4.5,8H13.5C14.88,8 16,9.12 16,10.5V20.5C16,21.05 15.55,21.5 15,21.5H6C5.45,21.5 5,21.05 5,20.5V10.5C5,9.12 6.12,8 7.5,8H4.5Z" />
            </svg>
          </div>
          <h3>Diagnosis: <span>{condition}</span></h3>
        </div>
        
        <div className="diagnosis-severity">
          <div className="severity-label">Severity:</div>
          <div className="severity-badge" style={{ backgroundColor: getSeverityColor() }}>
            {severity}
          </div>
        </div>
        
        <div className="diagnosis-recommendations">
          <h4>Recommendations:</h4>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>
                <span className="recommendation-bullet">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main ChatInterface component
const ChatInterface = () => {
  // Unique session ID
  const [sessionKey] = useState(Date.now());
  // Diagnosis state
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);
  // User input for controlled component
  const [userInput, setUserInput] = useState('');
  // Reference to submit button
  const submitButtonRef = useCallback(node => {
    if (node !== null) {
      submitButtonRef.current = node;
    }
  }, []);

  // Create a memoized diagnosis handler
  const handleDiagnosis = useCallback((symptoms) => {
    return DiagnosisService.getInstance().getDiagnosis(symptoms)
      .then(diagnosis => {
        setCurrentDiagnosis(diagnosis);
        return diagnosis;
      });
  }, []);

  // Custom user input component
  const CustomUserInput = ({ userDelay, placeholder, user, value, onChange, onSubmit, onKeyPress, className }) => {
    const handleChange = (e) => {
      setUserInput(e.target.value);
      if (onChange) onChange(e);
    };
    
    const handleSubmit = (e) => {
      if (onSubmit) onSubmit(e);
    };
    
    return (
      <div className="user-input-container">
        <input
          type="text"
          placeholder={placeholder}
          value={userInput}
          onChange={handleChange}
          onKeyPress={onKeyPress}
          className={`user-input ${className || ''}`}
        />
        <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          className="submit-button"
          type="submit"
          style={{ display: 'none' }}
        >
          Send
        </button>
      </div>
    );
  };
  
  // Doctor avatar URL
  const doctorAvatar = 'https://i.imgur.com/KbYnOGt.png';
  // User avatar URL with fallback
  const userAvatar = 'https://i.imgur.com/q8RU0Ic.png';

  // Chat steps configuration
  const steps = [
    {
      id: 'hello',
      message: "Hello! I'm Dr. Meta, your virtual health assistant. How can I help you today?",
      trigger: 'symptom-question',
    },
    {
      id: 'symptom-question',
      message: "What symptoms are you experiencing? Please describe them in detail.",
      trigger: 'user-symptoms',
    },
    {
      id: 'user-symptoms',
      user: true,
      trigger: 'analyzing',
    },
    {
      id: 'analyzing',
      message: "I'll analyze your symptoms now...",
      trigger: 'diagnosis',
    },
    {
      id: 'diagnosis',
      component: <DiagnosisDisplay 
                  condition={currentDiagnosis?.condition || "Loading..."}
                  severity={currentDiagnosis?.severity || "unknown"}
                  recommendations={currentDiagnosis?.recommendations || ["Please wait..."]}
                 />,
      asMessage: true,
      delay: 1000,
      trigger: ({ previousValue, steps }) => {
        // Get symptoms from user input
        const symptoms = steps['user-symptoms'].value;
        
        // Process diagnosis
        handleDiagnosis(symptoms);
        
        return 'after-diagnosis';
      },
    },
    {
      id: 'after-diagnosis',
      message: "Do you have any other symptoms you'd like me to evaluate?",
      trigger: 'options',
    },
    {
      id: 'options',
      options: [
        { value: 'yes', label: 'Yes, I have more symptoms', trigger: 'more-symptoms' },
        { value: 'no', label: 'No, thank you', trigger: 'end' },
      ],
    },
    {
      id: 'more-symptoms',
      message: "What additional symptoms are you experiencing?",
      trigger: 'new_user_symptoms',
    },
    {
      id: 'new_user_symptoms',
      user: true,
      trigger: 'analyzing-again',
    },
    {
      id: 'analyzing-again',
      message: "I'll analyze your new symptoms...",
      trigger: 'processing-again',
    },
    {
      id: 'processing-again',
      component: <div className="loading">Processing symptoms...</div>,
      asMessage: true,
      delay: 2000,
      trigger: ({ previousValue, steps }) => {
        // Get symptoms from the user input
        const symptoms = steps.new_user_symptoms.value;
        
        // Process diagnosis and store in state
        handleDiagnosis(symptoms);
        
        return 'diagnosis-again';
      },
    },
    {
      id: 'diagnosis-again',
      component: <DiagnosisDisplay 
                  condition={currentDiagnosis?.condition || "Loading..."}
                  severity={currentDiagnosis?.severity || "unknown"}
                  recommendations={currentDiagnosis?.recommendations || ["Please wait..."]}
                 />,
      asMessage: true,
      delay: 1000,
      trigger: 'follow-up',
    },
    {
      id: 'follow-up',
      message: "Is there anything else I can help you with?",
      trigger: 'options',
    },
    {
      id: 'end',
      message: "Take care! Come back anytime you need assistance.",
      end: true,
    },
  ];

  return (
    <div className="chatbot-container">
      <ChatBot
        steps={steps}
        key={sessionKey}
        userDelay={0}
        botDelay={800}
        customDelay={0}
        headerComponent={() => null}
        hideUserAvatar={true}
        hideBotAvatar={true}
        botAvatar={doctorAvatar}
        userAvatar={userAvatar}
        customComponents={{ 
          userInput: props => <CustomUserInput {...props} />,
        }}
        avatarStyle={{ 
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'inline-block',
          marginRight: '8px'
        }}
        bubbleOptionStyle={{ 
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          color: 'white',
          borderRadius: '18px',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer'
        }}
        bubbleStyle={{ 
          maxWidth: '80%',
          borderRadius: '18px',
          padding: '12px 16px',
          fontFamily: 'inherit',
          fontSize: '0.95rem'
        }}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          borderRadius: '0',
          border: 'none',
          boxShadow: 'none',
          background: 'transparent',
        }}
        footerStyle={{
          background: 'transparent',
          border: 'none',
          padding: '0'
        }}
        floating={false}
      />
    </div>
  );
};

export default ChatInterface; 