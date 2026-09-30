// Alternative: Use OpenAI GPT-3.5-turbo (free tier available)
// Add to .env: OPENAI_API_KEY=your_openai_key
// Get free key at: https://platform.openai.com/api-keys

const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateResponse(prompt) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        text: response.data.choices[0].message.content,
        success: true
      };
    } catch (error) {
      return {
        text: "I'm having trouble right now. Please try again.",
        success: false
      };
    }
  }
}

module.exports = new OpenAIService();