const axios = require('axios');

console.log('Starting API test...');

async function testApi(symptoms) {
  try {
    console.log(`Testing symptoms: ${symptoms}`);
    const response = await axios({
      method: 'post',
      url: 'https://disease-pred-svm.onrender.com/predict',
      data: {
        symptoms: symptoms
      },
      timeout: 15000
    });
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('API Test Failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Timeout or connectivity issue.');
      console.error(error.message);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
  }
}

// Test multiple symptom combinations to check if API returns different results
async function runTests() {
  await testApi('fever headache');
  console.log('\n---\n');
  await testApi('cough runny nose');
  console.log('\n---\n');
  await testApi('rash itching');
  console.log('\n---\n');
  await testApi('stomach pain nausea');
}

runTests(); 