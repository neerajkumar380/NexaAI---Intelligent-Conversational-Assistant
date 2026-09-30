const axios = require('axios');
require('dotenv').config();

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return;
  }

  console.log('🔑 API Key found, testing models...');

  // List of models to try
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.5-flash-latest'
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`\n🧪 Testing model: ${model}`);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: "Say hello!"
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log(`✅ ${model} WORKS!`);
      console.log('Response:', response.data.candidates[0].content.parts[0].text);
      console.log(`\n🎯 USE THIS MODEL: ${model}`);
      break;
      
    } catch (error) {
      console.log(`❌ ${model} failed:`, error.response?.data?.error?.message || error.message);
    }
  }
}

testGeminiAPI();