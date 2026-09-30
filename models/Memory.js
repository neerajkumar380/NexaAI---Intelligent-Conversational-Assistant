const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'preference', 'fact', 'emotion', 'relationship', 'goal'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  context: {
    type: String,
    default: ''
  },
  importance: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 1
  },
  tags: [String],
  relatedMemories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory'
  }],
  source: {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation'
    },
    messageIndex: Number,
    extractionMethod: {
      type: String,
      enum: ['explicit', 'inferred', 'pattern'],
      default: 'explicit'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, importance: -1 });
memorySchema.index({ userId: 1, lastAccessed: -1 });

module.exports = mongoose.model('Memory', memorySchema);