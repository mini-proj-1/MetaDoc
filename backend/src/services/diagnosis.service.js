import axios from 'axios';
import { config } from '../config/config.js';
import { predictLocal } from './localDiagnosis.js';

export const diagnose = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ error: "Valid symptoms array required" });
  }

  try {
    console.log(`Calling disease prediction API with symptoms: ${symptoms.join(' ')}`);
    
    const response = await axios.post(config.diseaseAPI, {
      symptoms: symptoms.join(' ')
    }, {
      timeout: config.apiTimeout
    });
    
    console.log('API response:', JSON.stringify(response.data, null, 2));
    
    // Handle both API response formats
    let disease = response.data.disease || response.data["Predicted Disease"] || "Unknown";
    
    // Validate the disease response - if it's questionable (like diagnosing hemorrhoids for fever)
    // we should use our local prediction instead
    if (isSuspiciousDiagnosis(disease, symptoms)) {
      console.log(`Suspicious diagnosis "${disease}" from API for symptoms: ${symptoms.join(', ')}. Using local diagnosis instead.`);
      disease = predictLocal(symptoms);
    }
    
    res.json({
      success: true,
      disease: disease,
      symptoms: symptoms,
      recommendations: getRecommendations(disease),
      severity: determineSeverity(disease, symptoms)
    });
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Use local diagnosis as fallback
    console.log('Using local diagnosis as fallback');
    const localDiagnosis = predictLocal(symptoms);
    
    res.json({
      success: true,
      disease: localDiagnosis,
      symptoms: symptoms,
      recommendations: getRecommendations(localDiagnosis),
      severity: determineSeverity(localDiagnosis, symptoms),
      usedFallback: true
    });
  }
};

// Check if the diagnosis makes sense for the symptoms
function isSuspiciousDiagnosis(disease, symptoms) {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  
  // Basic validation mapping - common symptoms for specific conditions
  const validationMap = {
    "Dimorphic hemmorhoids(piles)": ["rectal", "bleeding", "pain", "stool", "constipation", "bowel"],
    "Common Cold": ["cough", "sneeze", "congestion", "sore throat", "runny nose"],
    "Influenza": ["fever", "cough", "fatigue", "body ache", "chills"],
    "Pneumonia": ["cough", "chest", "breath", "breathing", "phlegm"],
    "Dengue": ["fever", "headache", "joint", "rash", "muscle", "eye"],
    "Tuberculosis": ["cough", "blood", "weight loss", "fever", "night", "sweat"]
  };
  
  // If we have validation criteria for this disease
  if (validationMap[disease]) {
    // Check if ANY of the known symptoms for this disease are present
    const hasAnyRelevantSymptom = validationMap[disease].some(keyword => 
      lowerSymptoms.some(symptom => symptom.includes(keyword))
    );
    
    // If none of the typical symptoms for this disease are present, it's suspicious
    return !hasAnyRelevantSymptom;
  }
  
  return false; // We don't have validation criteria, assume it's valid
}

// Determine severity based on disease and symptoms
function determineSeverity(disease, symptoms) {
  // High severity diseases
  const highSeverityDiseases = ['Tuberculosis', 'Malaria', 'Pneumonia', 'Dengue', 'Typhoid'];
  
  // Medium severity diseases
  const mediumSeverityDiseases = ['Flu', 'Influenza', 'Bronchial Asthma', 'Hypertension'];
  
  // Check if disease is in high severity list
  if (highSeverityDiseases.some(d => disease.toLowerCase().includes(d.toLowerCase()))) {
    return 'high';
  }
  
  // Check if disease is in medium severity list
  if (mediumSeverityDiseases.some(d => disease.toLowerCase().includes(d.toLowerCase()))) {
    return 'medium';
  }
  
  // Check for severe symptoms
  const severeSymptoms = ['difficulty breathing', 'chest pain', 'high fever', 'unconscious'];
  if (symptoms.some(s => severeSymptoms.some(ss => s.toLowerCase().includes(ss)))) {
    return 'high';
  }
  
  // Default to low severity
  return 'low';
}

// Get recommendations based on disease
function getRecommendations(disease) {
  const recommendations = {
    "Common Cold": [
      "Rest and stay hydrated",
      "Use over-the-counter pain relievers",
      "Use saline nasal drops",
      "Gargle with salt water"
    ],
    "Flu": [
      "Rest and stay hydrated",
      "Take over-the-counter fever reducers",
      "Wash hands frequently to prevent spreading",
      "Consider annual flu vaccination for prevention"
    ],
    "Influenza": [
      "Rest and stay hydrated",
      "Take over-the-counter fever reducers",
      "Wash hands frequently to prevent spreading",
      "Consider annual flu vaccination for prevention"
    ],
    "Pneumonia": [
      "Seek medical attention immediately",
      "Take prescribed antibiotics as directed",
      "Get plenty of rest",
      "Stay hydrated"
    ],
    "Dengue": [
      "Seek medical attention immediately",
      "Rest and stay hydrated",
      "Take acetaminophen for fever (avoid aspirin)",
      "Use mosquito repellent"
    ],
    "Dengue Fever": [
      "Seek medical attention immediately",
      "Rest and stay hydrated",
      "Take acetaminophen for fever (avoid aspirin)",
      "Use mosquito repellent"
    ],
    "Malaria": [
      "Seek immediate medical attention",
      "Complete the full course of antimalarial medication",
      "Use mosquito nets and insect repellent",
      "Eliminate standing water around your home"
    ],
    "Tuberculosis": [
      "Seek immediate medical attention",
      "Complete the full course of prescribed antibiotics",
      "Cover your mouth when coughing or sneezing",
      "Ensure good ventilation in living spaces"
    ],
    "Dimorphic hemmorhoids(piles)": [
      "Avoid fatty spicy food",
      "Use over-the-counter hemorrhoid treatments",
      "Take warm baths with epsom salt",
      "Increase fiber intake and stay hydrated"
    ],
    "Skin Allergy": [
      "Avoid known triggers and irritants",
      "Use cold compresses to reduce itching",
      "Apply hypoallergenic moisturizer",
      "Consider over-the-counter antihistamines"
    ],
    "Migraine": [
      "Rest in a quiet, dark room",
      "Apply cold compresses to forehead",
      "Take pain relievers as directed",
      "Stay hydrated and track triggers"
    ],
    "Gastroenteritis": [
      "Stay hydrated with clear fluids",
      "Eat bland, easy-to-digest foods",
      "Get plenty of rest",
      "Avoid dairy, caffeine, and spicy foods"
    ],
    "Tonsillitis": [
      "Gargle with warm salt water",
      "Take pain relievers as directed",
      "Drink plenty of fluids",
      "Rest your voice and get adequate sleep"
    ]
  };
  
  return recommendations[disease] || [
    "Consult with a healthcare provider for proper diagnosis",
    "Rest and stay hydrated",
    "Monitor your symptoms and seek medical attention if they worsen",
    "Maintain a healthy lifestyle"
  ];
} 