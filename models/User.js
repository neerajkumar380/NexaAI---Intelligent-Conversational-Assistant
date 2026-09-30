const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    name: String,
    age: Number,
    interests: [String],
    preferences: {
      communicationStyle: {
        type: String,
        enum: ['casual', 'formal', 'friendly', 'professional'],
        default: 'friendly'
      },
      topics: [String],
      personality: {
        type: String,
        enum: ['empathetic', 'humorous', 'analytical', 'supportive'],
        default: 'empathetic'
      }
    },
    avatar: String
  },
  chatbotPersona: {
    name: {
      type: String,
      default: 'Alex'
    },
    personality: {
      type: String,
      default: 'friendly and empathetic'
    },
    backstory: {
      type: String,
      default: 'I\'m Alex, a creative and curious person who loves connecting with people and learning about their experiences.'
    },
    interests: {
      type: [String],
      default: ['technology', 'art', 'music', 'travel', 'books']
    }
  },
  memoryProfile: {
    conversationCount: {
      type: Number,
      default: 0
    },
    lastInteraction: Date,
    knownFacts: [{
      fact: String,
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    emotionalState: {
      type: String,
      enum: ['happy', 'sad', 'excited', 'calm', 'stressed', 'neutral'],
      default: 'neutral'
    },
    conversationStyle: {
      formality: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      enthusiasm: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.7
      }
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);