# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 16+
- MongoDB (local or cloud)
- Google Gemini API key (free)

## 1-Minute Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/aichatbot.git
cd aichatbot

# Install dependencies
npm install
cd client && npm install && cd ..

# Get free Gemini API key
# Visit: https://aistudio.google.com/app/apikey

# Update .env file with your API key
# GEMINI_API_KEY=your_api_key_here

# Start MongoDB (if local)
mongod

# Run the application
npm run dev
# In new terminal:
cd client && npm start
```

## 🌐 Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🧪 Test All Features
1. **Memory Test**: Tell the AI your name and interests, then start a new conversation
2. **Emotion Test**: Try different tones (casual vs formal)
3. **Persona Test**: Customize the AI's personality in Profile settings
4. **Dashboard**: View conversation analytics and memory insights

## 🎯 STAN Challenge Requirements
✅ Human-like conversations  
✅ Long-term memory recall  
✅ Context-aware responses  
✅ Emotional intelligence  
✅ Identity consistency  
✅ Hallucination resistance  

Perfect for internship demos and portfolio projects!