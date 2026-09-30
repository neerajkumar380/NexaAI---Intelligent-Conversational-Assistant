class MockAIService {
  constructor() {
    this.responses = [
      "That's really interesting! I love hearing about your experiences. Tell me more about what excites you about that.",
      "I can sense your enthusiasm! It's wonderful when people are passionate about things. What drew you to that initially?",
      "You know, that reminds me of something I've been thinking about lately. I find it fascinating how different people approach these topics.",
      "I appreciate you sharing that with me. It's always great to learn something new from our conversations.",
      "That's a great point! I hadn't considered it from that angle before. You always bring such thoughtful perspectives.",
      "I can tell this means a lot to you. Your passion really comes through when you talk about it.",
      "Absolutely! I think you're onto something there. What made you realize that connection?",
      "That's so cool! I love how your mind works - you always find the most interesting angles on things.",
      "I'm really enjoying our conversation about this. You have such a unique way of looking at things.",
      "Thanks for being so open with me. I feel like I'm getting to know you better through these chats."
    ];
    
    this.memories = [
      { type: "personal", content: "User enjoys deep conversations", importance: 0.8 },
      { type: "preference", content: "Likes thoughtful discussions", importance: 0.7 },
      { type: "fact", content: "Values meaningful connections", importance: 0.6 }
    ];
    
    this.emotions = ["excited", "happy", "curious", "thoughtful", "engaged", "interested"];
  }

  async generateResponse(prompt) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = this.responses[Math.floor(Math.random() * this.responses.length)];
    const emotion = this.emotions[Math.floor(Math.random() * this.emotions.length)];
    const memory = this.memories[Math.floor(Math.random() * this.memories.length)];
    
    return {
      text: `${response}\n\n---ANALYSIS---\nEMOTION: [${emotion}]\nMEMORIES: [${JSON.stringify([memory])}]`,
      success: true
    };
  }

  buildPersonalizedPrompt(userMessage, user, memories, conversationHistory) {
    return userMessage; // Simple passthrough for mock
  }
}

module.exports = new MockAIService();