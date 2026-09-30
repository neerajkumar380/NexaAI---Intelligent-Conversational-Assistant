const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Conversation = require('../models/Conversation');
const { authenticate } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const mockAIService = require('../services/mockAIService');
const memoryService = require('../services/memoryService');

const router = express.Router();

// Use mock service when Gemini hits rate limits
let useGemini = true;
let lastRateLimitTime = 0;

const getAIService = () => {
  const now = Date.now();
  // If rate limited in last 2 minutes, use mock
  if (now - lastRateLimitTime < 120000) {
    return mockAIService;
  }
  return useGemini ? geminiService : mockAIService;
};

// Send message and get AI response
router.post('/message', authenticate, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;
    const io = req.app.get('io');

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentSessionId = sessionId || uuidv4();
    
    // Find or create conversation
    let conversation = await Conversation.findOne({
      userId,
      sessionId: currentSessionId,
      isActive: true
    });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId: currentSessionId,
        messages: [],
        context: {
          topics: [],
          mood: 'neutral',
          userState: 'active',
          keyPoints: []
        }
      });
    }

    // Add user message
    const userMessage = {
      sender: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    conversation.messages.push(userMessage);

    // Get relevant memories
    const memories = await memoryService.getRelevantMemories(userId, message, 10);
    
    // Get recent conversation history
    const recentHistory = conversation.messages.slice(-10);

    // Generate AI response with fallback
    const startTime = Date.now();
    const aiService = getAIService();
    const prompt = aiService.buildPersonalizedPrompt(
      message,
      req.user,
      memories,
      recentHistory
    );

    const aiResponse = await aiService.generateResponse(prompt);
    const processingTime = Date.now() - startTime;

    // Handle rate limiting
    if (!aiResponse.success && aiResponse.error && aiResponse.error.includes('429')) {
      lastRateLimitTime = Date.now();
      console.log('🔄 Switching to mock AI due to rate limit');
      const mockResponse = await mockAIService.generateResponse(prompt);
      aiResponse.text = mockResponse.text;
      aiResponse.success = true;
    }

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate response' });
    }

    // Parse combined response
    const responseText = aiResponse.text;
    let mainResponse = responseText;
    let emotionAnalysis = { emotion: 'neutral', intensity: 0.5 };
    let extractedMemories = [];

    // Extract analysis section
    if (responseText.includes('---ANALYSIS---')) {
      const parts = responseText.split('---ANALYSIS---');
      mainResponse = parts[0].trim();
      const analysisSection = parts[1];
      
      // Extract emotion
      const emotionMatch = analysisSection.match(/EMOTION:\s*\[([^\]]+)\]/);
      if (emotionMatch) {
        emotionAnalysis.emotion = emotionMatch[1].trim();
      }
      
      // Extract memories
      const memoriesMatch = analysisSection.match(/MEMORIES:\s*(\[.*?\])/);
      if (memoriesMatch) {
        try {
          extractedMemories = JSON.parse(memoriesMatch[1]);
        } catch (e) {
          console.log('Memory parsing failed, using empty array');
        }
      }
    }

    // Add bot message
    const botMessage = {
      sender: 'bot',
      content: mainResponse, // Use parsed main response
      timestamp: new Date(),
      metadata: {
        emotion: emotionAnalysis.emotion,
        tone: 'friendly',
        confidence: 0.9,
        processingTime,
        memoryUsed: memories.map(m => m._id.toString())
      }
    };
    conversation.messages.push(botMessage);

    // Update conversation context
    conversation.context.mood = emotionAnalysis.emotion;
    conversation.context.keyPoints.push(message.substring(0, 100));
    if (conversation.context.keyPoints.length > 10) {
      conversation.context.keyPoints = conversation.context.keyPoints.slice(-10);
    }

    await conversation.save();

    // Store extracted memories
    for (const memoryData of extractedMemories) {
      if (memoryData.content && memoryData.content.trim()) {
        await memoryService.storeMemory(
          userId,
          memoryData.type || 'fact',
          memoryData.content,
          `From conversation: ${message.substring(0, 100)}...`,
          memoryData.importance || 0.5
        );
      }
    }

    // Don't emit to socket here - let frontend handle the response directly
    // io.to(userId.toString()).emit('newMessage', {
    //   sessionId: currentSessionId,
    //   message: botMessage
    // });

    res.json({
      success: true,
      sessionId: currentSessionId,
      response: mainResponse, // Send clean response without analysis
      metadata: {
        emotion: emotionAnalysis.emotion,
        processingTime,
        memoriesUsed: memories.length,
        memoriesExtracted: extractedMemories.length,
        aiService: aiService === mockAIService ? 'mock' : 'gemini'
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation history
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('sessionId summary context startTime updatedAt messages');

    const conversationsWithPreview = conversations.map(conv => ({
      sessionId: conv.sessionId,
      summary: conv.summary || 'New conversation',
      lastMessage: conv.messages.length > 0 ? 
        conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...' : 
        'No messages',
      messageCount: conv.messages.length,
      startTime: conv.startTime,
      lastActivity: conv.updatedAt,
      context: conv.context
    }));

    res.json({
      conversations: conversationsWithPreview,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Conversation.countDocuments({ userId })
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// Get specific conversation
router.get('/conversations/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      userId,
      sessionId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversation: {
        sessionId: conversation.sessionId,
        messages: conversation.messages,
        context: conversation.context,
        startTime: conversation.startTime,
        isActive: conversation.isActive
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

// Delete conversation
router.delete('/conversations/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const result = await Conversation.findOneAndUpdate(
      { userId, sessionId },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Get chat statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalConversations = await Conversation.countDocuments({ userId });
    const totalMessages = await Conversation.aggregate([
      { $match: { userId } },
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);

    const memoryStats = await memoryService.getMemoryStats(userId);

    res.json({
      conversations: totalConversations,
      messages: totalMessages[0]?.total || 0,
      memories: memoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

module.exports = router;