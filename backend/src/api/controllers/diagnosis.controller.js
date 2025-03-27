// backend/src/api/controllers/diagnosis.controller.js
import { DiseaseApiService } from '../../services/disease-api.service.js';

// Database of recommendations for different conditions
const recommendations = {
  'Flu': [
    'Rest and stay hydrated',
    'Take over-the-counter fever reducers and pain relievers',
    'Wash your hands frequently to prevent spreading',
    'Consider annual flu vaccination for prevention'
  ],
  'Common Cold': [
    'Get plenty of rest',
    'Stay hydrated with water, juice, or warm lemon water with honey',
    'Use saline nasal drops or spray',
    'Gargle with salt water to soothe a sore throat'
  ],
  'Tuberculosis': [
    'Seek immediate medical attention',
    'Complete the full course of prescribed antibiotics',
    'Cover your mouth when coughing or sneezing',
    'Ensure good ventilation in living spaces'
  ],
  'Malaria': [
    'Seek immediate medical attention',
    'Complete the full course of antimalarial medication',
    'Use mosquito nets and insect repellent',
    'Eliminate standing water around your home'
  ],
  'Pneumonia': [
    'Seek medical attention immediately',
    'Take prescribed antibiotics as directed',
    'Get plenty of rest to help your body recover',
    'Stay hydrated and use a humidifier to ease breathing'
  ],
  'Dengue': [
    'Seek medical attention immediately',
    'Rest and stay hydrated',
    'Take acetaminophen for fever (avoid aspirin)',
    'Use mosquito repellent and eliminate breeding sites'
  ],
  'Typhoid': [
    'Seek medical attention for proper antibiotic treatment',
    'Drink purified water and avoid raw foods',
    'Wash hands thoroughly before eating',
    'Complete the full course of prescribed antibiotics'
  ],
  'Digital Motion Sickness': [
    'Take frequent breaks from digital screens',
    'Adjust screen brightness and contrast',
    'Ensure proper lighting in your workspace',
    'Consider blue light filtering glasses'
  ],
  'Virtual Fatigue Syndrome': [
    'Implement the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds',
    'Maintain proper posture while using digital devices',
    'Set up an ergonomic workspace',
    'Use blue light filters on your devices',
    'Ensure regular physical activity away from screens'
  ],
  'Unknown Condition': [
    'Consult with a healthcare provider for proper diagnosis',
    'Keep track of your symptoms and their frequency',
    'Maintain a healthy lifestyle with proper diet and exercise',
    'Ensure adequate rest and hydration'
  ]
};

// Fallback recommendations if disease is not in our database
const defaultRecommendations = [
  'Consult with a healthcare provider for proper diagnosis',
  'Rest and stay hydrated',
  'Monitor your symptoms and seek medical attention if they worsen',
  'Maintain a healthy lifestyle'
];

// Determine severity based on symptoms and disease
function determineSeverity(disease, symptoms) {
  // List of symptoms that might indicate higher severity
  const severeSymptoms = [
    'difficulty breathing', 'shortness of breath', 'chest pain',
    'high fever', 'severe headache', 'confusion', 'seizure', 
    'hemorrhage', 'paralysis', 'unconsciousness', 'stroke'
  ];
  
  // Check if any severe symptoms are present
  const hasSevereSymptoms = symptoms.some(symptom => 
    severeSymptoms.some(severeSymptom => 
      symptom.toLowerCase().includes(severeSymptom)
    )
  );
  
  // High severity diseases - comprehensive list of conditions requiring immediate attention
  const highSeverityDiseases = [
    'Tuberculosis', 'Malaria', 'Pneumonia', 'Dengue', 'Typhoid',
    'Paralysis', 'brain hemorrhage', 'stroke', 'Heart attack', 'heart failure',
    'Jaundice', 'Hepatitis', 'Fungal infection', 'Drug Reaction',
    'AIDS', 'Chicken pox', 'Impetigo', 'Diabetes'
  ];
  
  // Medium severity diseases
  const mediumSeverityDiseases = [
    'Flu', 'Allergy', 'Bronchial Asthma', 'Hypertension', 
    'Migraine', 'Cervical spondylosis', 'Urinary tract infection', 
    'Psoriasis', 'GERD', 'Chronic cholestasis', 'Osteoarthritis'
  ];
  
  // Check if the disease name contains any high severity condition
  const hasHighSeverityDisease = highSeverityDiseases.some(highSeverityDisease => 
    disease.toLowerCase().includes(highSeverityDisease.toLowerCase())
  );
  
  // Check if the disease name contains any medium severity condition
  const hasMediumSeverityDisease = mediumSeverityDiseases.some(mediumSeverityDisease => 
    disease.toLowerCase().includes(mediumSeverityDisease.toLowerCase())
  );
  
  if (hasSevereSymptoms || hasHighSeverityDisease) {
    return 'high';
  } else if (hasMediumSeverityDisease) {
    return 'medium';
  } else {
    return 'low';
  }
}

export const diagnose = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Please provide symptoms'
      });
    }
    
    // Ensure symptoms is an array
    const symptomsArray = Array.isArray(symptoms) ? symptoms : [symptoms];
    
    console.log('Received symptoms:', symptomsArray);
    
    // Call the disease prediction API
    const predictionResult = await DiseaseApiService.predictDisease(symptomsArray);
    
    if (!predictionResult.success) {
      console.error('Prediction failed:', predictionResult.error);
      // Fallback to a default diagnosis
      return res.json({
        success: true,
        condition: 'Unknown Condition',
        severity: 'medium',
        recommendations: recommendations['Unknown Condition'] || defaultRecommendations,
        message: "I'm having trouble analyzing your symptoms right now. Here are some general health recommendations that might help.",
        apiError: predictionResult.error,
        usedFallback: true
      });
    }
    
    const disease = predictionResult.disease;
    console.log(`Diagnosed disease: ${disease}${predictionResult.usedFallback ? ' (using fallback)' : predictionResult.usedMapping ? ' (using symptom mapping)' : ''}`);
    
    // Determine severity
    const severity = determineSeverity(disease, symptomsArray);
    
    // Get recommendations - if we have API precautions, convert them to recommendations
    let diseaseRecommendations;
    
    if (predictionResult.precautions) {
      // Convert API precautions string to array of recommendations
      const precautionsArray = predictionResult.precautions
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      diseaseRecommendations = precautionsArray.length > 0 
        ? precautionsArray 
        : (recommendations[disease] || defaultRecommendations);
    } else {
      diseaseRecommendations = recommendations[disease] || defaultRecommendations;
    }
    
    // Prepare response message based on severity and description
    let message = `Based on your symptoms, I've diagnosed that you may have ${disease}. `;
    
    // Add description if available from API or our database
    if (predictionResult.description && predictionResult.description !== "No description available") {
      message += `${predictionResult.description} `;
    }
    
    if (severity === 'high') {
      message += 'This condition requires immediate medical attention. ';
    } else if (severity === 'medium') {
      message += 'This condition requires attention but is not immediately life-threatening. ';
    } else {
      message += 'This is a mild condition that can typically be managed at home. ';
    }
    
    message += 'Here are some recommendations to help manage your condition:';
    
    // Send a comprehensive response
    res.json({
      success: true,
      condition: disease,
      severity: severity,
      recommendations: diseaseRecommendations,
      message: message,
      usedFallback: predictionResult.usedFallback || false,
      usedMapping: predictionResult.usedMapping || false
    });
    
    // Log the response being sent
    console.log('Sending diagnosis response:', JSON.stringify({
      success: true,
      condition: disease,
      severity: severity,
      recommendations: diseaseRecommendations,
      message: message,
      usedFallback: predictionResult.usedFallback || false,
      usedMapping: predictionResult.usedMapping || false
    }, null, 2));
    
  } catch (error) {
    console.error('Diagnosis controller error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}; 