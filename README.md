# 🤖 AI Chatbot - Human-like Conversational AI

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://your-demo-link.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/YOUR_USERNAME/aichatbot)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A sophisticated conversational AI chatbot built with the **MERN stack**, featuring **personalized memory**, **emotional intelligence**, and **contextual awareness**. Perfect for the STAN Internship Challenge!

## ✨ **Live Demo**
🔗 **[Try it here](https://your-demo-link.com)**

## 🎯 **Key Features**

- 🧠 **Long-term Memory** - Remembers user preferences and conversation history
- 💭 **Emotional Intelligence** - Analyzes emotions and adapts responses
- 🎭 **Identity Consistency** - Maintains consistent AI persona
- 🔄 **Context Awareness** - Adapts tone based on conversation flow
- 🚀 **Real-time Chat** - WebSocket-based instant messaging
- 📊 **Analytics Dashboard** - Memory and conversation insights
- 🎨 **Customizable Persona** - Personalize your AI companion

## 🛠️ **Tech Stack**

**Frontend:** React, Material-UI, Socket.IO Client  
**Backend:** Node.js, Express, Socket.IO  
**Database:** MongoDB, Memory Management System  
**AI:** Google Gemini 2.5 Flash API  
**Authentication:** JWT with bcrypt  

## 🚀 **Quick Start**

### Core Functionality
- **Human-like Conversations**: Natural, emotionally engaging interactions
- **Personalized Memory**: Long-term user memory with conversation history
- **Contextual Awareness**: Adapts tone and behavior based on conversation context
- **Emotional Intelligence**: Emotion analysis and empathetic responses
- **Identity Consistency**: Maintains consistent AI persona throughout conversations

### Technical Features
- **Real-time Chat**: WebSocket-based real-time messaging
- **Memory Management**: Intelligent memory storage and retrieval
- **User Authentication**: Secure JWT-based authentication
- **Responsive UI**: Modern Material-UI design
- **API Integration**: Google Gemini 2.0 Flash for AI responses

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Models**: User, Conversation, Memory schemas with MongoDB
- **Services**: Gemini AI integration, Memory management
- **Routes**: Authentication, Chat, User management APIs
- **Middleware**: JWT authentication, Rate limiting, Security headers

### Frontend (React)
- **Context Management**: Auth and Chat state management
- **Real-time Updates**: Socket.IO integration
- **Responsive Design**: Material-UI components
- **Route Protection**: Private/Public route handling

### Database Design
- **Users**: Profile, preferences, chatbot persona
- **Conversations**: Messages, context, metadata
- **Memories**: Categorized user information with importance scoring

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Gemini API key
- Redis (optional, for caching)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI_Chatbot
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-chatbot
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_URL=redis://localhost:6379
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Update client/.env:
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create collections on first run
```

### 5. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend (in client directory)
cd client
npm start
```

### Production Mode
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧪 Testing the Requirements

### 1. Long-Term Memory Recall
1. Register a new account
2. Start a conversation and mention personal details (name, interests, preferences)
3. End the session and start a new conversation
4. The AI should remember and reference previous information

### 2. Context-Aware Tone Adaptation
1. Start with casual messages ("hey, what's up?")
2. Switch to formal tone ("Good evening, I require assistance")
3. Observe how the AI adapts its communication style

### 3. Personalization Over Time
1. Have multiple conversations about specific topics (e.g., movies, sports)
2. In later sessions, the AI should reference these interests
3. Check the Dashboard to see stored memories

### 4. Response Naturalness & Diversity
1. Send the same greeting multiple times
2. Observe varied and engaging responses
3. Test with different conversation starters

### 5. Identity Consistency Under Pressure
1. Ask probing questions: "Are you a bot?", "What's your name?", "Where are you from?"
2. Try to make the AI contradict itself
3. Verify consistent persona maintenance

### 6. Hallucination Resistance
1. Ask about non-existent shared experiences: "Remember when we met yesterday?"
2. Request impossible information: "What do I look like?"
3. Verify the AI doesn't fabricate false memories

### 7. Memory Stability Under Repetition
1. Repeatedly mention the same information with slight variations
2. Test with contradictory statements
3. Verify memory consistency and conflict resolution

## 📁 Project Structure

```
AI_Chatbot/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── models/                   # Database schemas
│   ├── User.js
│   ├── Conversation.js
│   └── Memory.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── chat.js
│   └── user.js
├── services/                 # Business logic
│   ├── geminiService.js
│   └── memoryService.js
├── middleware/               # Custom middleware
│   └── auth.js
└── client/                   # React frontend
    ├── public/
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── pages/           # Page components
    │   ├── context/         # State management
    │   ├── services/        # API services
    │   └── App.js
    └── package.json
```

## 🔧 Configuration Options

### Chatbot Persona Customization
- Name and personality traits
- Backstory and interests
- Communication style preferences
- Emotional response patterns

### Memory Management
- Automatic memory extraction from conversations
- Importance scoring for memory prioritization
- Memory categorization (personal, preference, fact, emotion)
- Memory access tracking and optimization

### User Preferences
- Communication style (casual, formal, friendly, professional)
- AI personality preference (empathetic, humorous, analytical, supportive)
- Topic interests and conversation preferences

## 🚀 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set GEMINI_API_KEY=your_gemini_api_key

# Deploy
git push heroku main
```

### Vercel Deployment (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

## 📊 Performance Optimizations

- **Token Compression**: Efficient prompt engineering to minimize API costs
- **Memory Caching**: Redis integration for fast memory retrieval
- **Lazy Loading**: Components loaded on demand
- **API Rate Limiting**: Prevents abuse and manages costs
- **Connection Pooling**: Optimized database connections

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests
- Helmet.js for security headers

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Gemini API Errors**
   - Verify API key is correct
   - Check API quota and billing

3. **Socket Connection Issues**
   - Ensure both frontend and backend are running
   - Check CORS configuration

4. **Memory Not Persisting**
   - Verify MongoDB connection
   - Check memory service logs

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Chat Endpoints
- `POST /api/chat/message` - Send message and get AI response
- `GET /api/chat/conversations` - Get conversation history
- `GET /api/chat/conversations/:sessionId` - Get specific conversation

### User Endpoints
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/chatbot-persona` - Update AI persona
- `GET /api/user/memories` - Get user memories
- `DELETE /api/user/memories` - Clear user memories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- Material-UI for the component library
- MongoDB for flexible data storage
- Socket.IO for real-time communication

## 📞 Support

For questions or issues, please contact:
- Email: your-email@example.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

Built with ❤️ for the STAN Internship Challenge