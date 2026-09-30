const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const memoryService = require('../services/memoryService');

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { profile } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { profile } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        chatbotPersona: user.chatbotPersona
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update chatbot persona
router.put('/chatbot-persona', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatbotPersona } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { chatbotPersona } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Chatbot persona updated successfully',
      chatbotPersona: user.chatbotPersona
    });
  } catch (error) {
    console.error('Update chatbot persona error:', error);
    res.status(500).json({ error: 'Failed to update chatbot persona' });
  }
});

// Get user memories
router.get('/memories', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 20 } = req.query;

    const memories = await memoryService.getRelevantMemories(userId, '', parseInt(limit));
    
    let filteredMemories = memories;
    if (type) {
      filteredMemories = memories.filter(memory => memory.type === type);
    }

    res.json({
      memories: filteredMemories.map(memory => ({
        id: memory._id,
        type: memory.type,
        content: memory.content,
        importance: memory.importance,
        confidence: memory.confidence,
        createdAt: memory.createdAt,
        lastAccessed: memory.lastAccessed,
        accessCount: memory.accessCount,
        tags: memory.tags
      }))
    });
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: 'Failed to retrieve memories' });
  }
});

// Clear user memories
router.delete('/memories', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const success = await memoryService.clearUserMemories(userId);
    
    if (success) {
      res.json({ message: 'Memories cleared successfully' });
    } else {
      res.status(500).json({ error: 'Failed to clear memories' });
    }
  } catch (error) {
    console.error('Clear memories error:', error);
    res.status(500).json({ error: 'Failed to clear memories' });
  }
});

// Get user preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('profile.preferences memoryProfile');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      preferences: user.profile?.preferences || {},
      memoryProfile: user.memoryProfile
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
});

// Update user preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'profile.preferences': preferences } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.profile.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get memory stats
    const memoryStats = await memoryService.getMemoryStats(userId);
    
    // Get user with memory profile
    const user = await User.findById(userId).select('memoryProfile chatbotPersona');
    
    res.json({
      memoryStats,
      memoryProfile: user.memoryProfile,
      chatbotPersona: user.chatbotPersona
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

module.exports = router;