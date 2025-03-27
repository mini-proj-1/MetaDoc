export const predictLocal = (symptoms) => {
  // Convert symptoms to lowercase for case-insensitive matching
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  
  // Define symptom mapping for common conditions
  const symptomMapping = [
    { 
      keywords: ["fever", "cough", "sore throat", "runny nose", "congestion", "sneeze"], 
      disease: "Common Cold" 
    },
    { 
      keywords: ["fever", "cough", "fatigue", "body ache", "muscle pain", "headache", "chills"], 
      disease: "Influenza" 
    },
    { 
      keywords: ["cough", "chest pain", "shortness of breath", "difficulty breathing", "phlegm"], 
      disease: "Pneumonia" 
    },
    { 
      keywords: ["fever", "headache", "joint pain", "rash", "muscle pain", "eye pain"], 
      disease: "Dengue Fever" 
    },
    { 
      keywords: ["itchy", "itching", "rash", "rashes", "skin", "bumps", "irritation", "red"], 
      disease: "Skin Allergy" 
    },
    { 
      keywords: ["headache", "sensitivity to light", "nausea", "vomiting", "migraine", "aura"], 
      disease: "Migraine" 
    },
    { 
      keywords: ["sore throat", "difficulty swallowing", "swollen tonsils", "throat pain"], 
      disease: "Tonsillitis" 
    },
    { 
      keywords: ["abdominal pain", "diarrhea", "nausea", "vomiting", "stomach pain", "cramps"], 
      disease: "Gastroenteritis" 
    }
  ];

  // Find the condition with the most matching symptoms
  let bestMatch = { disease: "Unknown Condition", matches: 0 };
  
  for (const mapping of symptomMapping) {
    // Count how many symptoms match this condition
    const matchCount = mapping.keywords.filter(keyword => 
      lowerSymptoms.some(symptom => symptom.includes(keyword))
    ).length;
    
    // If we found a better match
    if (matchCount > bestMatch.matches) {
      bestMatch = { disease: mapping.disease, matches: matchCount };
    }
  }
  
  console.log(`Local diagnosis found: ${bestMatch.disease} with ${bestMatch.matches} matching symptoms`);
  return bestMatch.disease;
}; 