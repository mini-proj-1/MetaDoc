import axios from 'axios';

// Test the external Disease Prediction API
async function testExternalApi() {
  try {
    console.log('Testing Disease Prediction API at https://disease-pred-svm.onrender.com/predict');
    
    const response = await axios({
      method: 'post',
      url: 'https://disease-pred-svm.onrender.com/predict',
      data: {
        symptoms: 'fever skin lesions'
      },
      timeout: 15000
    });
    
    console.log('Response from external API:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('External API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Test the local backend API
async function testLocalApi() {
  try {
    console.log('\nTesting local backend API at http://localhost:3005/api/diagnose');
    
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3005/api/diagnose',
      data: {
        symptoms: ['fever', 'skin lesions']
      },
      timeout: 5000
    });
    
    console.log('Response from local API:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Local API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('=== API INTEGRATION TEST ===');
  
  // Test external API first
  const externalResult = await testExternalApi();
  
  // Only test local API if external API succeeded
  if (externalResult) {
    await testLocalApi();
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

runTests().catch(error => {
  console.error('Test script failed:', error);
}); 