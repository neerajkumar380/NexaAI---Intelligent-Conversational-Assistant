import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

const initialState = {
  currentSessionId: null,
  messages: [],
  conversations: [],
  isLoading: false,
  isTyping: false,
  error: null,
  stats: null
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isTyping: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'START_NEW_CONVERSATION':
      return {
        ...state,
        currentSessionId: action.payload,
        messages: [],
        error: null
      };
    case 'LOAD_CONVERSATION':
      return {
        ...state,
        currentSessionId: action.payload.sessionId,
        messages: action.payload.messages,
        error: null
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false
      };
    case 'UPDATE_LAST_MESSAGE':
      const updatedMessages = [...state.messages];
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          ...action.payload
        };
      }
      return {
        ...state,
        messages: updatedMessages
      };
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload
      };
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations]
      };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.sessionId === action.payload.sessionId
            ? { ...conv, ...action.payload }
            : conv
        )
      };
    case 'REMOVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(
          conv => conv.sessionId !== action.payload
        )
      };
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload
      };
    case 'CLEAR_CHAT':
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      loadStats();
      
      // Socket listeners are disabled to prevent duplicate messages
      // Messages are handled directly through API responses
      
      // const handleNewMessage = (data) => {
      //   if (data.sessionId === state.currentSessionId) {
      //     dispatch({
      //       type: 'ADD_MESSAGE',
      //       payload: data.message
      //     });
      //   }
      // };

      // socketService.onNewMessage(handleNewMessage);

      // return () => {
      //   socketService.offNewMessage(handleNewMessage);
      // };
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      dispatch({
        type: 'SET_CONVERSATIONS',
        payload: response.conversations
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await apiService.getChatStats();
      dispatch({
        type: 'SET_STATS',
        payload: stats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startNewConversation = () => {
    const sessionId = uuidv4();
    dispatch({
      type: 'START_NEW_CONVERSATION',
      payload: sessionId
    });
    return sessionId;
  };

  const loadConversation = async (sessionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getConversation(sessionId);
      dispatch({
        type: 'LOAD_CONVERSATION',
        payload: {
          sessionId,
          messages: response.conversation.messages
        }
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load conversation'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      sender: 'user',
      content: message,
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      const response = await apiService.sendMessage(message, state.currentSessionId);
      
      const botMessage = {
        sender: 'bot',
        content: response.response,
        timestamp: new Date(),
        metadata: response.metadata
      };

      // Only add bot message once from API response
      dispatch({ type: 'ADD_MESSAGE', payload: botMessage });
      
      // Update current session ID if it was a new conversation
      if (response.sessionId !== state.currentSessionId) {
        dispatch({
          type: 'START_NEW_CONVERSATION',
          payload: response.sessionId
        });
      }

      // Refresh conversations list
      loadConversations();
      
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || 'Failed to send message'
      });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const deleteConversation = async (sessionId) => {
    try {
      await apiService.deleteConversation(sessionId);
      dispatch({
        type: 'REMOVE_CONVERSATION',
        payload: sessionId
      });
      
      // If current conversation was deleted, start new one
      if (sessionId === state.currentSessionId) {
        startNewConversation();
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to delete conversation'
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearChat = () => {
    dispatch({ type: 'CLEAR_CHAT' });
  };

  const value = {
    ...state,
    startNewConversation,
    loadConversation,
    sendMessage,
    deleteConversation,
    loadConversations,
    loadStats,
    clearError,
    clearChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};