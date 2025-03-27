import React, { useState, useEffect, useRef, useCallback } from 'react';
import { diagnoseSymptoms } from './services/api';
import './App.css';
// Import avatar images
import doctorAvatar from './assets/doctor-avatar.svg';
import userAvatar from './assets/user-avatar.svg';
// Import PatientHistory component
import PatientHistory from './components/PatientHistory';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Metaverse Doctor. What symptoms are you experiencing?", sender: "bot" },
  ]);
  // Use separate state for controlled input that doesn't trigger re-renders
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [diagnoses, setDiagnoses] = useState([]); // Store multiple diagnoses
  const [activeDiagnosisIndex, setActiveDiagnosisIndex] = useState(0); // Track active diagnosis tab
  const [walletAddress, setWalletAddress] = useState(null); // Store user's wallet address
  const [showHistory, setShowHistory] = useState(false); // Toggle patient history view
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const inputRef = useRef(null); // Reference to the input element
  
  // Use this to handle input without state updates
  const handleInputChange = (e) => {
    if (inputRef.current) {
      inputRef.current.value = e.target.value;
    }
  };

  // Only update the state when needed (like when sending)
  const getInputValue = () => {
    return inputRef.current ? inputRef.current.value.trim() : "";
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Text-to-Speech setup
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Speech-to-Text setup
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Set to false to stop after each utterance
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');

          if (inputRef.current) {
            inputRef.current.value = transcript;
          }

          // If this is a final result, stop listening
          if (event.results[event.results.length - 1].isFinal) {
            recognitionRef.current.stop();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setMessages(prev => [...prev, {
            text: `Speech recognition error: ${event.error}. Please try again.`,
            sender: "bot",
            isError: true
          }]);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          
          // Remove the listening indicator message
          setMessages(prev => prev.filter(msg => !msg.text.includes("I'm listening")));
        };
      } else {
        console.error('Speech recognition not supported');
      }
    } catch (error) {
      console.error('Speech recognition setup error:', error);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak text function - only used when button is clicked
  const speak = (text) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not available in this browser');
      return;
    }
    
    try {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Add error handling
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };
      
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Error using speech synthesis:', error);
    }
  };

  // Initialize app and clean existing diagnoses on load
  useEffect(() => {
    // Log environment information for debugging
    console.log("=== METAVERSE DOCTOR ENVIRONMENT ===");
    console.log("Running in:", process.env.NODE_ENV);
    console.log("Expected API:", process.env.REACT_APP_API_URL || 'http://localhost:3001');
    
    // Check connectivity to backend
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        if (response.ok) {
          console.log('Backend connection successful! Server is up.');
        } else {
          console.warn('Backend responded but with an error status:', response.status);
        }
      } catch (error) {
        console.error('Backend connection failed! Error:', error.message);
        console.log('APPLICATION WILL USE FALLBACK DIAGNOSIS');
      }
    };
    
    checkBackend();
    
    // Check for Font Awesome availability
    setTimeout(() => {
      const iconElements = document.querySelectorAll('.fa-solid');
      if (iconElements.length > 0) {
        const computedStyle = window.getComputedStyle(iconElements[0], ':before');
        if (!computedStyle.content || computedStyle.content === 'none') {
          console.warn('Font Awesome icons may not be loading correctly');
        } else {
          console.log('Font Awesome icons loaded successfully');
        }
      } else {
        console.warn('No Font Awesome icons found in the document');
      }
    }, 1000);
    
    // Clear any invalid diagnoses on component mount
    setDiagnoses(prev => {
      return prev.filter(diagnosis => isValidDiagnosis(diagnosis));
    });
  }, []);

  // Filter function to remove invalid diagnoses 
  const isValidDiagnosis = (diagnosis) => {
    return diagnosis && 
      diagnosis.disease && 
      diagnosis.disease !== "Unable to diagnose at this time" &&
      !diagnosis.disease.includes("Unable to diagnose") &&
      diagnosis.disease !== "Unknown";
  };

  // Add a function to handle saving diagnoses to blockchain
  const saveDiagnosisToBlockchain = async (diagnosis, symptoms) => {
    try {
      if (!diagnosis || !isValidDiagnosis(diagnosis)) {
        console.error('Invalid diagnosis for blockchain storage');
        return false;
      }
      
      // Determine API URL - use environment variable or default
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // Log the API URL to help with debugging
      console.log('Using API URL:', API_URL);
      
      // Format the record data
      const recordData = {
        diagnosis: {
          disease: diagnosis.disease,
          recommendations: diagnosis.recommendations
        },
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms]
      };
      
      // Use a placeholder wallet address for development if none available
      const address = walletAddress || '0x1234567890123456789012345678901234567890';
      
      // Make API call to store the diagnosis
      const response = await axios.post(`${API_URL}/api/history/from-diagnosis`, recordData, {
        params: { address }
      });
      
      if (response.data.success) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving diagnosis to blockchain:', error);
      // In production, we might want to show an error to the user
      return false;
    }
  };

  // Update handleSend to properly update diagnoses state and add more logging
  const handleSend = async () => {
    const currentInput = getInputValue();
    if (!currentInput || isTyping) return;

    console.log("Handling send with input:", currentInput);

    // Add user message
    const userMessage = { text: currentInput, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input field
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // Show typing indicator
    setIsTyping(true);

    try {
      // Split the input by commas or periods followed by spaces
      const symptoms = currentInput.split(/[,\.]\s*/);
      console.log("Symptoms extracted:", symptoms);
      
      // Call the API with a timeout
      console.log("Calling diagnosis API...");
      
      const response = await diagnoseSymptoms(symptoms);
      console.log("Diagnosis response:", response);
      
      // Create a new valid diagnosis object
      if (response && response.disease) {
        const newDiagnosis = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          disease: cleanDiseaseName(response.disease),
          symptoms: response.symptoms,
          severity: response.severity || 'unknown',
          recommendations: response.recommendations || [],
          usedFallback: !!response.usedFallback
        };
        
        console.log("Setting diagnosis:", newDiagnosis);
        setDiagnoses([newDiagnosis]);
        setActiveDiagnosisIndex(0);
        
        // Add message about diagnosis
        const diagnosisMessage = {
          text: response.usedFallback 
            ? `I've analyzed your symptoms offline (${response.symptoms.join(', ')}) and prepared a preliminary diagnosis.`
            : `I've analyzed your symptoms (${response.symptoms.join(', ')}) and prepared a diagnosis.`,
          sender: "bot",
        };
        
        setMessages((prev) => [...prev, diagnosisMessage]);
      } else {
        throw new Error("Invalid diagnosis data");
      }
    } catch (error) {
      console.error("Error in diagnosis process:", error);
      
      // Add error message
      setMessages((prev) => [...prev, {
        text: "I'm sorry, I couldn't complete the diagnosis. Please try describing your symptoms differently.",
        sender: "bot",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to clean disease names
  const cleanDiseaseName = (diseaseName) => {
    // Check for specific problematic disease names
    if (diseaseName.toLowerCase().includes("dimorphic hemmorhoids") || 
        diseaseName.includes("piles")) {
      return "Hemorrhoids";
    }
    return diseaseName;
  };

  const handleSpeakDiagnosis = (diagnosis) => {
    if (!diagnosis) return;
    
    const diagnosisText = `Based on your symptoms, you might have ${diagnosis.disease}. 
      The severity is ${diagnosis.severity}. 
      Recommendations: ${diagnosis.recommendations.join(', ')}`;
    
    speak(diagnosisText);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, {
        text: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
        sender: "bot",
        isError: true
      }]);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      try {
        // Clear the input field
        if (inputRef.current) {
          inputRef.current.value = '';
        }

        // Add the listening indicator message
        setMessages(prev => [...prev, {
          text: "I'm listening... Speak your symptoms clearly.",
          sender: "bot"
        }]);

        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setMessages(prev => [...prev, {
          text: "Could not start speech recognition. Please make sure your microphone is connected and you've granted permission to use it.",
          sender: "bot",
          isError: true
        }]);
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Get severity class based on the severity level
  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'high-severity';
      case 'medium':
        return 'medium-severity';
      case 'low':
        return 'low-severity';
      default:
        return 'unknown-severity';
    }
  };

  const Message = ({ message, isTyping }) => {
    const [isNew, setIsNew] = useState(true);
    
    // Remove the 'new' status after animation completes
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 300); // Match animation duration
      
      return () => clearTimeout(timer);
    }, []);
    
    // Check if this is a listening indicator message
    const isListeningIndicator = message.text && message.text.includes("I'm listening");
    
    return (
      <div className={`message ${message.sender} ${isNew ? 'new-message' : ''}`}>
        <div className="avatar">
          {message.sender === "bot" ? (
            <img src={doctorAvatar} alt="Doctor" className="doctor-avatar" />
          ) : (
            <img src={userAvatar} alt="User" className="user-avatar" />
          )}
        </div>
        <div className={`message-bubble ${message.isError ? "error" : ""} ${isListeningIndicator ? "listening-indicator" : ""}`}>
          {isTyping ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <div className="message-content">
              {message.text}
              {isListeningIndicator && (
                <div className="listening-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add a function to connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setShowHistory(true);
          
          // Notify the user
          setMessages(prev => [...prev, {
            text: `Wallet connected! You can now view your medical history.`,
            sender: "bot"
          }]);
          
          return accounts[0];
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setMessages(prev => [...prev, {
          text: `Error connecting wallet: ${error.message}. Using demo mode.`,
          sender: "bot",
          isError: true
        }]);
      }
    } else {
      console.warn('Ethereum object not found. Using demo mode.');
      // For demo purposes, set a mock address
      const mockAddress = '0x1234567890123456789012345678901234567890';
      setWalletAddress(mockAddress);
      setShowHistory(true);
      
      setMessages(prev => [...prev, {
        text: `No wallet found. Using demo mode with a mock wallet address.`,
        sender: "bot"
      }]);
      
      return mockAddress;
    }
  };

  // Add a function to toggle history
  const toggleHistory = async () => {
    if (!walletAddress) {
      await connectWallet();
    } else {
      setShowHistory(!showHistory);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1>Metaverse Doctor</h1>
          <p>Advanced AI diagnostic assistance with secure blockchain storage</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="env-indicator">Dev Mode: API URL: {process.env.REACT_APP_API_URL || 'http://localhost:3001'}</div>
          )}
        </div>
      </header>
      
      <main className="main-container">
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message, index) => (
              <Message key={index} message={message} isTyping={isTyping && index === messages.length - 1} />
            ))}
            {isTyping && (
              <div className="message-bubble bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-area-container">
            <div className="input-area">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter symptoms separated by commas (e.g., fever, headache)"
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                className="static-no-animation"
              />
              <button 
                onClick={handleSend} 
                disabled={!getInputValue() || isTyping}
                className="send-button static-no-animation"
                title="Send message"
                type="button"
              >
                <span className="fa-solid fa-paper-plane"></span>
                <span className="icon-fallback">→</span>
              </button>
              <button 
                onClick={toggleSpeechRecognition} 
                className={`mic-button ${isListening ? 'active' : ''}`}
                title={isListening ? 'Stop listening' : 'Start speaking'}
                type="button"
              >
                <span className="fa-solid fa-microphone"></span>
                <span className="icon-fallback">🎤</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Add debugging for diagnoses state */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{position: 'fixed', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '10px', color: 'white', fontSize: '10px', maxWidth: '400px', maxHeight: '200px', overflow: 'auto', zIndex: 9999, borderRadius: '4px'}}>
            <div>Diagnoses count: {diagnoses.length}</div>
            <div>Active index: {activeDiagnosisIndex}</div>
            <div>Has valid diagnosis: {diagnoses.length > 0 && isValidDiagnosis(diagnoses[activeDiagnosisIndex]) ? 'Yes' : 'No'}</div>
          </div>
        )}
        
        {diagnoses.length > 0 && diagnoses[activeDiagnosisIndex] && isValidDiagnosis(diagnoses[activeDiagnosisIndex]) ? (
          <div className="diagnosis-container" style={{display: 'block'}}>
            <div className="diagnosis-header">
              <h2>Diagnosis</h2>
              <div className="diagnosis-controls">
                <button 
                  className="blockchain-button"
                  onClick={toggleHistory}
                  title={showHistory ? "Hide Medical History" : "View Medical History"}
                >
                  {showHistory ? "Hide History" : "View History"}
                </button>
                <button 
                  className="speak-button"
                  onClick={() => handleSpeakDiagnosis(diagnoses[activeDiagnosisIndex])}
                >
                  Speak Diagnosis
                </button>
              </div>
            </div>
            
            <div className="diagnosis-content">
              <div className={`severity-indicator ${getSeverityClass(diagnoses[activeDiagnosisIndex].severity)}`}>
                {diagnoses[activeDiagnosisIndex].severity.charAt(0).toUpperCase() + diagnoses[activeDiagnosisIndex].severity.slice(1)} Severity
              </div>
              <h3>{diagnoses[activeDiagnosisIndex].disease}</h3>
              <p className="symptoms-list">
                <strong>Symptoms:</strong> {diagnoses[activeDiagnosisIndex].symptoms.join(', ')}
              </p>
              
              {diagnoses[activeDiagnosisIndex].recommendations && (
                <div className="recommendations">
                  <h4>Recommendations:</h4>
                  <ul>
                    {Array.isArray(diagnoses[activeDiagnosisIndex].recommendations) ? (
                      diagnoses[activeDiagnosisIndex].recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))
                    ) : (
                      <li>{diagnoses[activeDiagnosisIndex].recommendations}</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="diagnosis-timestamp">
                Diagnosed on: {diagnoses[activeDiagnosisIndex].timestamp}
              </div>
            </div>
            
            {showHistory && (
              <PatientHistory patientAddress={walletAddress} />
            )}
          </div>
        ) : (
          diagnoses.length > 0 && (
            <div className="diagnosis-error" style={{display: 'block'}}>
              <p>There was an issue displaying your diagnosis. Please try describing your symptoms again.</p>
              <p>Debug info: {JSON.stringify({diagnosesLength: diagnoses.length, activeIndex: activeDiagnosisIndex})}</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App; 