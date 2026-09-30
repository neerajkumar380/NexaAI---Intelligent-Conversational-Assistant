import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon, SmartToy as BotIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    interests: [],
    preferences: {
      communicationStyle: 'friendly',
      topics: [],
      personality: 'empathetic'
    }
  });
  const [chatbotPersona, setChatbotPersona] = useState({
    name: 'Alex',
    personality: 'friendly and empathetic',
    backstory: '',
    interests: []
  });
  const [newInterest, setNewInterest] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newBotInterest, setNewBotInterest] = useState('');

  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.profile?.name || '',
        age: user.profile?.age || '',
        interests: user.profile?.interests || [],
        preferences: {
          communicationStyle: user.profile?.preferences?.communicationStyle || 'friendly',
          topics: user.profile?.preferences?.topics || [],
          personality: user.profile?.preferences?.personality || 'empathetic'
        }
      });
      
      setChatbotPersona({
        name: user.chatbotPersona?.name || 'Alex',
        personality: user.chatbotPersona?.personality || 'friendly and empathetic',
        backstory: user.chatbotPersona?.backstory || '',
        interests: user.chatbotPersona?.interests || []
      });
    }
  }, [user]);

  const handleUserProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUserProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleChatbotPersonaChange = (field, value) => {
    setChatbotPersona(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !userProfile.interests.includes(newInterest.trim())) {
      setUserProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setUserProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !userProfile.preferences.topics.includes(newTopic.trim())) {
      setUserProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          topics: [...prev.preferences.topics, newTopic.trim()]
        }
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (topic) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        topics: prev.preferences.topics.filter(t => t !== topic)
      }
    }));
  };

  const addBotInterest = () => {
    if (newBotInterest.trim() && !chatbotPersona.interests.includes(newBotInterest.trim())) {
      setChatbotPersona(prev => ({
        ...prev,
        interests: [...prev.interests, newBotInterest.trim()]
      }));
      setNewBotInterest('');
    }
  };

  const removeBotInterest = (interest) => {
    setChatbotPersona(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await apiService.updateProfile(userProfile);
      updateUser({ profile: userProfile });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChatbotPersona = async () => {
    setLoading(true);
    try {
      await apiService.updateChatbotPersona(chatbotPersona);
      updateUser({ chatbotPersona });
      toast.success('AI persona updated successfully!');
    } catch (error) {
      toast.error('Failed to update AI persona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile & Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Customize your profile and AI companion's personality
      </Typography>

      <Grid container spacing={4}>
        {/* User Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Your Profile</Typography>
            </Box>

            <TextField
              fullWidth
              label="Name"
              value={userProfile.name}
              onChange={(e) => handleUserProfileChange('name', e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Age"
              type="number"
              value={userProfile.age}
              onChange={(e) => handleUserProfileChange('age', e.target.value)}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Communication Style</InputLabel>
              <Select
                value={userProfile.preferences.communicationStyle}
                onChange={(e) => handleUserProfileChange('preferences.communicationStyle', e.target.value)}
                label="Communication Style"
              >
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="formal">Formal</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Preferred AI Personality</InputLabel>
              <Select
                value={userProfile.preferences.personality}
                onChange={(e) => handleUserProfileChange('preferences.personality', e.target.value)}
                label="Preferred AI Personality"
              >
                <MenuItem value="empathetic">Empathetic</MenuItem>
                <MenuItem value="humorous">Humorous</MenuItem>
                <MenuItem value="analytical">Analytical</MenuItem>
                <MenuItem value="supportive">Supportive</MenuItem>
              </Select>
            </FormControl>

            {/* Interests */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Your Interests
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} variant="outlined" size="small">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userProfile.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={() => removeInterest(interest)}
                  size="small"
                />
              ))}
            </Box>

            {/* Preferred Topics */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Preferred Conversation Topics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add topic"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button onClick={addTopic} variant="outlined" size="small">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {userProfile.preferences.topics.map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  onDelete={() => removeTopic(topic)}
                  size="small"
                />
              ))}
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : 'Save Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* AI Persona Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BotIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">AI Companion Persona</Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Customize your AI companion's personality and background to make conversations more engaging and personal.
            </Alert>

            <TextField
              fullWidth
              label="AI Name"
              value={chatbotPersona.name}
              onChange={(e) => handleChatbotPersonaChange('name', e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Personality Description"
              value={chatbotPersona.personality}
              onChange={(e) => handleChatbotPersonaChange('personality', e.target.value)}
              margin="normal"
              placeholder="e.g., friendly and empathetic, witty and curious"
            />

            <TextField
              fullWidth
              label="Backstory"
              multiline
              rows={4}
              value={chatbotPersona.backstory}
              onChange={(e) => handleChatbotPersonaChange('backstory', e.target.value)}
              margin="normal"
              placeholder="Tell your AI's story - where they're from, what they like to do, their experiences..."
            />

            {/* AI Interests */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              AI Interests & Hobbies
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add interest"
                value={newBotInterest}
                onChange={(e) => setNewBotInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBotInterest()}
              />
              <Button onClick={addBotInterest} variant="outlined" size="small">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {chatbotPersona.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={() => removeBotInterest(interest)}
                  size="small"
                  color="primary"
                />
              ))}
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveChatbotPersona}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : 'Save AI Persona'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;