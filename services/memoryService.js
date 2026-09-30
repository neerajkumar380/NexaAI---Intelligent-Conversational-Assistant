const Memory = require('../models/Memory');
const User = require('../models/User');
const geminiService = require('./geminiService');

class MemoryService {
  async storeMemory(userId, type, content, context = '', importance = 0.5) {
    try {
      const memory = new Memory({
        userId,
        type,
        content,
        context,
        importance,
        confidence: 1.0,
        tags: this.extractTags(content)
      });

      await memory.save();
      
      // Update user memory profile
      await this.updateUserMemoryProfile(userId, type, content);
      
      return memory;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }

  async getRelevantMemories(userId, query = '', limit = 10) {
    try {
      const memories = await Memory.find({
        userId,
        isActive: true
      })
      .sort({ importance: -1, lastAccessed: -1 })
      .limit(limit);

      // Update access count and timestamp
      const memoryIds = memories.map(m => m._id);
      await Memory.updateMany(
        { _id: { $in: memoryIds } },
        { 
          $inc: { accessCount: 1 },
          $set: { lastAccessed: new Date() }
        }
      );

      return memories;
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  async processAndStoreMemories(userId, userMessage, conversationId) {
    try {
      const extractedMemories = await geminiService.extractMemories(userMessage);
      
      const storedMemories = [];
      for (const memoryData of extractedMemories) {
        if (memoryData.content && memoryData.content.trim()) {
          const memory = await this.storeMemory(
            userId,
            memoryData.type || 'fact',
            memoryData.content,
            `From conversation: ${userMessage.substring(0, 100)}...`,
            memoryData.importance || 0.5
          );
          storedMemories.push(memory);
        }
      }

      return storedMemories;
    } catch (error) {
      console.error('Error processing memories:', error);
      return [];
    }
  }

  async updateUserMemoryProfile(userId, type, content) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Update conversation count
      user.memoryProfile.conversationCount += 1;
      user.memoryProfile.lastInteraction = new Date();

      // Add to known facts
      user.memoryProfile.knownFacts.push({
        fact: content,
        confidence: 1.0,
        timestamp: new Date()
      });

      // Keep only recent facts (last 50)
      if (user.memoryProfile.knownFacts.length > 50) {
        user.memoryProfile.knownFacts = user.memoryProfile.knownFacts.slice(-50);
      }

      await user.save();
    } catch (error) {
      console.error('Error updating user memory profile:', error);
    }
  }

  extractTags(content) {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'];
    
    return words
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5);
  }

  async getMemoryStats(userId) {
    try {
      const totalMemories = await Memory.countDocuments({ userId, isActive: true });
      const memoryTypes = await Memory.aggregate([
        { $match: { userId: userId, isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      const recentMemories = await Memory.find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('content type createdAt');

      return {
        total: totalMemories,
        byType: memoryTypes,
        recent: recentMemories
      };
    } catch (error) {
      console.error('Error getting memory stats:', error);
      return { total: 0, byType: [], recent: [] };
    }
  }

  async clearUserMemories(userId) {
    try {
      await Memory.updateMany(
        { userId },
        { $set: { isActive: false } }
      );
      
      const user = await User.findById(userId);
      if (user) {
        user.memoryProfile.knownFacts = [];
        user.memoryProfile.conversationCount = 0;
        await user.save();
      }

      return true;
    } catch (error) {
      console.error('Error clearing memories:', error);
      return false;
    }
  }
}

module.exports = new MemoryService();