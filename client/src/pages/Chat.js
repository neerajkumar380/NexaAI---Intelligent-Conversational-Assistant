import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Drawer,
  AppBar,
  Toolbar,
  Chip,
  CircularProgress,
  Divider,
  Avatar,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 300;

const MessageBubble = ({ message, isBot, timestamp, metadata }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        mb: 2,
        alignItems: 'flex-start'
      }}
    >
      {isBot && (
        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
          <BotIcon />
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: '70%',
          minWidth: '100px'
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isBot ? 'grey.100' : 'primary.main',
            color: isBot ? 'text.primary' : 'primary.contrastText',
            borderRadius: 2,
            borderTopLeftRadius: isBot ? 0 : 2,
            borderTopRightRadius: isBot ? 2 : 0,
          }}
        >
          <Typography variant="body1" component="div">
            {isBot ? (
              <ReactMarkdown>{message}</ReactMarkdown>
            ) : (
              message
            )}
          </Typography>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(timestamp), 'HH:mm')}
          </Typography>
          {metadata?.emotion && (
            <Chip
              label={metadata.emotion}
              size="small"
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </Box>
      {!isBot && (
        <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
          <PersonIcon />
        </Avatar>
      )}
    </Box>
  );
};

const ConversationList = ({ conversations, currentSessionId, onSelectConversation, onDeleteConversation, onNewConversation }) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={onNewConversation}
          sx={{
            width: '100%',
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            py: 1
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          <Typography>New Chat</Typography>
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {conversations.map((conversation) => (
          <ListItem key={conversation.sessionId} disablePadding>
            <ListItemButton
              selected={conversation.sessionId === currentSessionId}
              onClick={() => onSelectConversation(conversation.sessionId)}
              sx={{ px: 2 }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle2" noWrap>
                    {conversation.summary || 'New Conversation'}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {conversation.lastMessage}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {format(new Date(conversation.lastActivity), 'MMM dd, HH:mm')}
                    </Typography>
                  </Box>
                }
              />
              <Tooltip title="Delete conversation">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.sessionId);
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const Chat = () => {
  const [message, setMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const {
    messages,
    conversations,
    currentSessionId,
    isLoading,
    isTyping,
    error,
    sendMessage,
    startNewConversation,
    loadConversation,
    deleteConversation,
    clearError
  } = useChat();

  useEffect(() => {
    if (!currentSessionId) {
      startNewConversation();
    }
  }, [currentSessionId, startNewConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    await sendMessage(message);
    setMessage('');
  };

  const handleNewConversation = () => {
    startNewConversation();
    setDrawerOpen(false);
  };

  const handleSelectConversation = (sessionId) => {
    loadConversation(sessionId);
    setDrawerOpen(false);
  };

  const handleDeleteConversation = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(sessionId);
      toast.success('Conversation deleted');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <ConversationList
          conversations={conversations}
          currentSessionId={currentSessionId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
        />
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <BotIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {user?.chatbotPersona?.name || 'AI Assistant'}
            </Typography>
            <Chip
              label={`${messages.length} messages`}
              size="small"
              variant="outlined"
            />
          </Toolbar>
        </AppBar>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.paper'
          }}
        >
          {messages.length === 0 && !isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}
            >
              <BotIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Hi! I'm {user?.chatbotPersona?.name || 'Alex'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                {user?.chatbotPersona?.backstory || 
                 "I'm here to chat with you! I remember our conversations and adapt to your style. What would you like to talk about?"}
              </Typography>
            </Box>
          )}

          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg.content}
              isBot={msg.sender === 'bot'}
              timestamp={msg.timestamp}
              metadata={msg.metadata}
            />
          ))}

          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                <BotIcon />
              </Avatar>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {user?.chatbotPersona?.name || 'Alex'} is typing...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isTyping}
            multiline
            maxRows={4}
            sx={{ mr: 1 }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!message.trim() || isTyping}
            sx={{ p: 1.5 }}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default Chat;