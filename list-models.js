const axios = require('axios');
require('dotenv').config();

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    console.log('🔍 Fetching available models...');
    
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    console.log('\n✅ Available models:');
    response.data.models.forEach(model => {
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`📝 ${model.name.replace('models/', '')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error listing models:', error.response?.data || error.message);
    console.log('\n🔧 Quick fixes:');
    console.log('1. Get new API key: https://aistudio.google.com/app/apikey');
    console.log('2. Try different region/account');
    console.log('3. Use OpenAI instead (see openaiService.js)');
  }
}

listAvailableModels();