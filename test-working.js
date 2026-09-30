const axios = require('axios');
require('dotenv').config();

async function testWorkingModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    console.log('🧪 Testing gemini-2.5-flash...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: "Hello! Please respond with a friendly greeting."
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ SUCCESS! Model is working!');
    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    console.log('\n🚀 Your chatbot is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWorkingModel();