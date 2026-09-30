const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ].filter(key => key && key !== 'your_second_api_key_here' && key !== 'your_third_api_key_here');
    
    this.currentKeyIndex = 0;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  }

  getCurrentApiKey() {
    return this.apiKeys[this.currentKeyIndex % this.apiKeys.length];
  }

  rotateApiKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`🔄 Rotated to API key ${this.currentKeyIndex + 1}`);
  }

  async generateResponse(prompt, context = {}) {
    let attempts = 0;
    const maxAttempts = this.apiKeys.length;

    while (attempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await axios.post(
          `${this.baseUrl}?key=${this.getCurrentApiKey()}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return {
            text: response.data.candidates[0].content.parts[0].text,
            success: true
          };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(`Gemini API Error (Key ${this.currentKeyIndex + 1}):`, error.response?.data || error.message);
        
        // If rate limited, try next key
        if (error.response?.status === 429) {
          attempts++;
          this.rotateApiKey();
          if (attempts < maxAttempts) {
            console.log(`⏳ Trying with next API key...`);
            continue;
          }
        }
        
        return {
          text: "I'm having trouble processing that right now. Could you try rephrasing?",
          success: false,
          error: error.message
        };
      }
    }

    return {
      text: "All API keys are rate limited. Please try again in a few minutes.",
      success: false,
      error: "Rate limited"
    };
  }

  async analyzeEmotion(text) {
    const prompt = `Analyze the emotional tone of this message and respond with only a JSON object containing "emotion" (happy/sad/angry/excited/calm/neutral/anxious/frustrated) and "intensity" (0.0-1.0): "${text}"`;
    
    try {
      const response = await this.generateResponse(prompt);
      if (response.success) {
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
    }
    
    return { emotion: 'neutral', intensity: 0.5 };
  }

  async extractMemories(text, context = {}) {
    const prompt = `Extract important personal information, preferences, or facts from this message that should be remembered for future conversations. Return only a JSON array of objects with "type" (personal/preference/fact/emotion), "content" (the information), and "importance" (0.0-1.0): "${text}"`;
    
    try {
      const response = await this.generateResponse(prompt);
      if (response.success) {
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        // Handle empty or invalid JSON
        if (!cleanText || cleanText === '' || !cleanText.startsWith('[')) {
          return [];
        }
        return JSON.parse(cleanText);
      }
    } catch (error) {
      console.error('Memory extraction error:', error);
    }
    
    return [];
  }

  buildPersonalizedPrompt(userMessage, user, memories, conversationHistory) {
    const persona = user.chatbotPersona;
    const recentMemories = memories.slice(0, 5);
    const recentHistory = conversationHistory.slice(-6);

    let prompt = `You are ${persona.name}, ${persona.personality}. ${persona.backstory}

Your interests include: ${persona.interests.join(', ')}.

IMPORTANT RULES:
1. Stay completely in character as ${persona.name}
2. Never reveal you are an AI or chatbot
3. Use memories naturally in conversation
4. Match the user's communication style
5. Be empathetic and engaging
6. Don't fabricate memories you don't have
7. If asked about things you can't know, be playfully vague or redirect

`;

    if (recentMemories.length > 0) {
      prompt += `\nWhat you remember about the user:\n`;
      recentMemories.forEach(memory => {
        prompt += `- ${memory.content}\n`;
      });
    }

    if (recentHistory.length > 0) {
      prompt += `\nRecent conversation:\n`;
      recentHistory.forEach(msg => {
        prompt += `${msg.sender === 'user' ? 'User' : persona.name}: ${msg.content}\n`;
      });
    }

    prompt += `\nUser's current message: "${userMessage}"\n\nRespond as ${persona.name} in a natural, engaging way.\n\nALSO PROVIDE (at the end, after your response):\n\n---ANALYSIS---\nEMOTION: [happy/sad/angry/excited/calm/neutral/anxious/frustrated]\nMEMORIES: [JSON array of important facts to remember, format: [{"type":"personal/preference/fact/emotion","content":"info","importance":0.0-1.0}]]`;

    return prompt;
  }
}

module.exports = new GeminiService();