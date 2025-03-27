// backend/src/services/disease-api.service.js
import axios from 'axios';
import { config } from '../config/config.js';

export class DiseaseApiService {
  static async predictDisease(symptomsArray) {
    try {
      // Convert array to space-separated string as expected by the API
      const symptomsString = Array.isArray(symptomsArray) 
        ? symptomsArray.join(' ')
        : symptomsArray; // In case a string is passed directly
      
      console.log(`Calling disease prediction API with symptoms: ${symptomsString}`);

      try {
        // Call the Disease Prediction API with correct format
        console.log(`Attempting to call external API at: ${config.diseasePredictionApi.endpoint}`);
        console.log(`With timeout: ${config.diseasePredictionApi.timeout}ms`);
        
        const response = await axios({
          method: 'post',
          url: config.diseasePredictionApi.endpoint,
          data: {
            symptoms: symptomsString
          },
          timeout: config.diseasePredictionApi.timeout
        });
        
        console.log('Disease API response:', JSON.stringify(response.data, null, 2));
        
        // Check if the response has the expected 'disease' property from the new API
        if (response.data && response.data.disease) {
          const disease = response.data.disease;
          console.log(`API successfully predicted disease: ${disease}`);
          
          return {
            success: true,
            disease: disease,
            description: this.getDescriptionForDisease(disease),
            precautions: this.getPrecautionsForDisease(disease).join(', '),
            symptoms: symptomsArray,
            usedFallback: false,
            usedMapping: false
          };
        } 
        // Check if it's using the old API format with "Predicted Disease"
        else if (response.data && response.data["Predicted Disease"]) {
          const disease = response.data["Predicted Disease"];
          const description = response.data["Description"] || "No description available";
          const precautions = response.data["Precautions"] || "";
          
          console.log(`API successfully predicted disease: ${disease} (using old API format)`);
          
          return {
            success: true,
            disease: disease,
            description: description,
            precautions: precautions,
            symptoms: symptomsArray,
            usedFallback: false,
            usedMapping: false
          };
        } else {
          // If the response doesn't have the expected properties, use our fallback
          console.log('API response missing expected properties, using fallback');
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.log(`External API failed: ${apiError.message}, using fallback algorithm`);
        
        // Since we've observed the API returns the same diagnosis regardless of symptoms,
        // we'll implement a mapping of symptoms to common diseases for more accurate results
        const symptomText = symptomsString.toLowerCase();
        
        // Define symptom-to-disease mapping for more accurate predictions
        const symptomMapping = [
          { keywords: ['fever', 'cough', 'sore throat', 'runny nose', 'congestion', 'sneeze'], disease: 'Common Cold' },
          { keywords: ['fever', 'cough', 'fatigue', 'body ache', 'muscle pain', 'headache', 'chills'], disease: 'Influenza (Flu)' },
          { keywords: ['cough', 'chest pain', 'shortness of breath', 'difficulty breathing', 'phlegm'], disease: 'Pneumonia' },
          { keywords: ['fever', 'headache', 'joint pain', 'rash', 'muscle pain', 'eye pain', 'pain behind eyes'], disease: 'Dengue Fever' },
          { keywords: ['itchy', 'itching', 'rash', 'rashes', 'skin', 'bumps', 'irritation', 'red'], disease: 'Fungal infection' },
          { keywords: ['headache', 'sensitivity to light', 'nausea', 'vomiting', 'migraine', 'aura'], disease: 'Migraine' },
          { keywords: ['sore throat', 'difficulty swallowing', 'swollen tonsils', 'throat pain'], disease: 'Tonsillitis' },
          { keywords: ['abdominal pain', 'diarrhea', 'nausea', 'vomiting', 'stomach pain', 'cramps'], disease: 'Gastroenteritis' },
          { keywords: ['burning', 'urination', 'frequent urination', 'painful urination', 'bladder'], disease: 'Urinary tract infection' },
          { keywords: ['joint pain', 'stiffness', 'swelling', 'arthritis', 'joint'], disease: 'Arthritis' },
          { keywords: ['fatigue', 'weight loss', 'increased thirst', 'frequent urination', 'hunger', 'sugar'], disease: 'Diabetes' },
          { keywords: ['chest pain', 'pressure', 'shortness of breath', 'pain in arm', 'jaw pain'], disease: 'Heart attack' },
          { keywords: ['fever', 'chills', 'sweats', 'headache', 'body aches', 'malaise'], disease: 'Malaria' },
          { keywords: ['persistent cough', 'coughing up blood', 'weight loss', 'night sweats', 'tb'], disease: 'Tuberculosis' },
          { keywords: ['itchiness', 'redness', 'swelling', 'hives', 'allergic', 'allergy'], disease: 'Allergy' },
          { keywords: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'asthma'], disease: 'Asthma' },
          { keywords: ['high blood pressure', 'headache', 'vision problems', 'hypertension'], disease: 'Hypertension' },
          { keywords: ['fever', 'weakness', 'jaundice', 'abdominal pain', 'yellow skin', 'yellow eyes'], disease: 'Hepatitis' },
          { keywords: ['fever', 'headache', 'stiff neck', 'confusion', 'seizures', 'sensitivity to light'], disease: 'Meningitis' },
          { keywords: ['sudden weakness', 'numbness', 'difficulty speaking', 'severe headache', 'paralysis'], disease: 'Stroke' },
          { keywords: ['headache', 'dizziness', 'fatigue', 'digital', 'screen', 'computer', 'monitor'], disease: 'Digital Eyestrain Syndrome' },
          { keywords: ['fatigue', 'strain', 'eye', 'vision', 'blurry', 'dry eyes'], disease: 'Computer Vision Syndrome' },
          { keywords: ['hemorrhoid', 'pile', 'rectal', 'bleeding', 'itching anus', 'pain during bowel movements'], disease: 'Dimorphic hemmorhoids(piles)' },
          { keywords: ['breathing difficulties', 'wheezing', 'fatigue', 'confusion', 'rapid heartbeat'], disease: 'Chronic respiratory disease' },
          { keywords: ['anxiety', 'worry', 'nervousness', 'restlessness', 'panic', 'fear'], disease: 'Anxiety Disorder' },
          { keywords: ['sadness', 'loss of interest', 'hopelessness', 'sleep problems', 'fatigue', 'depression'], disease: 'Depression' }
        ];
        
        // Use our symptom mapping for more accurate results
        let matchedDisease = null;
        let maxMatches = 0;
        
        for (const mapping of symptomMapping) {
          const matches = mapping.keywords.filter(keyword => 
            symptomText.includes(keyword.toLowerCase())
          ).length;
          
          if (matches > 0 && matches > maxMatches) {
            maxMatches = matches;
            matchedDisease = mapping.disease;
          }
        }
        
        // If we found a match in our mapping
        if (matchedDisease) {
          console.log(`Fallback symptom mapping determined disease: ${matchedDisease} (matched ${maxMatches} keywords)`);
          
          // Generate appropriate precautions based on matched disease
          const precautions = this.getPrecautionsForDisease(matchedDisease);
          
          return {
            success: true,
            disease: matchedDisease,
            description: this.getDescriptionForDisease(matchedDisease),
            precautions: precautions.join(', '),
            symptoms: symptomsArray,
            usedFallback: true,
            usedMapping: true
          };
        }
        
        // Fallback to a very simple algorithm if no keyword matches
        let disease = 'Unknown Condition';
        
        console.log(`No symptom matches found. Using generic fallback diagnosis: ${disease}`);
        
        return {
          success: true,
          disease: disease,
          description: this.getDescriptionForDisease(disease),
          precautions: this.getPrecautionsForDisease(disease).join(', '),
          symptoms: symptomsArray,
          usedFallback: true,
          usedMapping: false
        };
      }
    } catch (error) {
      console.error('Disease API Service general error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to generate appropriate descriptions
  static getDescriptionForDisease(disease) {
    const descriptions = {
      'Common Cold': 'A viral infection of the nose and throat, causing runny nose, sneezing, and mild discomfort.',
      'Influenza (Flu)': 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.',
      'Pneumonia': 'An infection that inflames the air sacs in one or both lungs, which may fill with fluid.',
      'Dengue Fever': 'A mosquito-borne viral disease causing high fever, severe headache, and joint and muscle pain.',
      'Fungal infection': 'An infection caused by fungi, often affecting the skin, nails, or mucous membranes.',
      'Migraine': 'A headache disorder characterized by recurrent headaches that are moderate to severe, often with nausea and sensitivity to light and sound.',
      'Tonsillitis': 'Inflammation of the tonsils, causing sore throat, difficulty swallowing, and swollen lymph nodes.',
      'Gastroenteritis': 'Inflammation of the stomach and intestines, typically resulting from bacterial or viral infection.',
      'Urinary tract infection': 'An infection in any part of the urinary system, including kidneys, bladder, ureters, and urethra.',
      'Arthritis': 'Inflammation of one or more joints, causing pain and stiffness that can worsen with age.',
      'Diabetes': 'A metabolic disease that causes high blood sugar due to problems with insulin production or function.',
      'Heart attack': 'Occurs when blood flow to a part of the heart is blocked, often by a blood clot.',
      'Malaria': 'A serious disease caused by a parasite that commonly infects a certain type of mosquito.',
      'Tuberculosis': 'A potentially serious infectious bacterial disease that mainly affects the lungs.',
      'Allergy': 'An abnormal immune response to substances that are typically harmless.',
      'Asthma': 'A condition in which a person\'s airways become inflamed, narrow, and swell, producing extra mucus.',
      'Hypertension': 'A condition in which the force of the blood against the artery walls is too high.',
      'Hepatitis': 'Inflammation of the liver, commonly caused by viral infection.',
      'Meningitis': 'Inflammation of the protective membranes covering the brain and spinal cord.',
      'Stroke': 'A medical condition in which poor blood flow to the brain results in cell death.',
      'Digital Eyestrain Syndrome': 'Eye discomfort and vision problems caused by prolonged use of digital devices.',
      'Computer Vision Syndrome': 'Eye strain and other symptoms caused by extended viewing of digital screens.',
      'Dimorphic hemmorhoids(piles)': 'Swollen blood vessels in the anal area causing pain, discomfort, and sometimes bleeding.',
      'Chronic respiratory disease': 'Long-term conditions affecting the airways and other structures of the lungs.',
      'Anxiety Disorder': 'A mental health condition characterized by feelings of worry, anxiety, or fear that are strong enough to interfere with daily activities.',
      'Depression': 'A mental health disorder characterized by persistently depressed mood or loss of interest in activities.',
      'Flu': 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.',
      'Unknown Condition': 'Your symptoms do not clearly indicate a specific condition. Please consult a healthcare professional for proper diagnosis.'
    };
    
    return descriptions[disease] || 'No description available';
  }
  
  // Helper method to generate appropriate precautions
  static getPrecautionsForDisease(disease) {
    const precautions = {
      'Common Cold': [
        'rest and stay hydrated', 
        'use over-the-counter pain relievers', 
        'use saline nasal drops', 
        'gargle with salt water'
      ],
      'Influenza (Flu)': [
        'rest and stay hydrated',
        'take over-the-counter fever reducers and pain relievers',
        'wash your hands frequently to prevent spreading',
        'consider annual flu vaccination for prevention'
      ],
      'Flu': [
        'rest and stay hydrated',
        'take over-the-counter fever reducers and pain relievers',
        'wash your hands frequently to prevent spreading',
        'consider annual flu vaccination for prevention'
      ],
      'Pneumonia': [
        'seek medical attention immediately',
        'take prescribed antibiotics as directed',
        'get plenty of rest to help your body recover',
        'stay hydrated and use a humidifier to ease breathing'
      ],
      'Dengue Fever': [
        'seek medical attention immediately',
        'rest and stay hydrated',
        'take acetaminophen for fever (avoid aspirin)',
        'use mosquito repellent and eliminate breeding sites'
      ],
      'Malaria': [
        'seek immediate medical attention',
        'complete the full course of antimalarial medication',
        'use mosquito nets and insect repellent',
        'eliminate standing water around your home'
      ],
      'Tuberculosis': [
        'seek immediate medical attention',
        'complete the full course of prescribed antibiotics',
        'cover your mouth when coughing or sneezing',
        'ensure good ventilation in living spaces'
      ],
      'Digital Eyestrain Syndrome': [
        'take frequent breaks from digital screens',
        'adjust screen brightness and contrast',
        'ensure proper lighting in your workspace',
        'consider blue light filtering glasses'
      ],
      'Computer Vision Syndrome': [
        'follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds',
        'adjust your screen position and text size',
        'use proper lighting and reduce glare',
        'consider using artificial tears to prevent dry eyes'
      ],
      'Unknown Condition': [
        'consult with a healthcare provider for proper diagnosis',
        'keep track of your symptoms and their frequency',
        'maintain a healthy lifestyle with proper diet and exercise',
        'ensure adequate rest and hydration'
      ]
    };
    
    return precautions[disease] || [
      'consult with a healthcare provider for proper diagnosis',
      'rest and stay hydrated',
      'monitor your symptoms and seek medical attention if they worsen',
      'maintain a healthy lifestyle'
    ];
  }
} 