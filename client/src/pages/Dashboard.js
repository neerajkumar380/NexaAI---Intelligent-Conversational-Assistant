import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Chat as ChatIcon,
  Psychology as PsychologyIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import apiService from '../services/api';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const MemoryItem = ({ memory }) => (
  <ListItem>
    <ListItemText
      primary={memory.content}
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Chip label={memory.type} size="small" />
          <Typography variant="caption" color="text.secondary">
            {format(new Date(memory.createdAt), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Accessed {memory.accessCount} times
          </Typography>
        </Box>
      }
    />
  </ListItem>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearMemoriesDialog, setClearMemoriesDialog] = useState(false);
  const [clearingMemories, setClearingMemories] = useState(false);
  
  const { user } = useAuth();
  const { stats, loadStats } = useChat();

  useEffect(() => {
    loadDashboardData();
    loadMemories();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboardData();
      setDashboardData(data);
      loadStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadMemories = async () => {
    try {
      const response = await apiService.getUserMemories();
      setMemories(response.memories);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const handleClearMemories = async () => {
    setClearingMemories(true);
    try {
      await apiService.clearUserMemories();
      setMemories([]);
      setClearMemoriesDialog(false);
      toast.success('Memories cleared successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to clear memories');
    } finally {
      setClearingMemories(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your AI conversations and memory profile
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Conversations"
            value={stats?.conversations || 0}
            icon={<ChatIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Messages Sent"
            value={stats?.messages || 0}
            icon={<ChatIcon sx={{ fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Memories Stored"
            value={stats?.memories?.total || 0}
            icon={<MemoryIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI Interactions"
            value={dashboardData?.memoryProfile?.conversationCount || 0}
            icon={<PsychologyIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* AI Persona Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Companion Profile
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Name: {user?.chatbotPersona?.name || 'Alex'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {user?.chatbotPersona?.backstory || 'No backstory set'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Interests:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {user?.chatbotPersona?.interests?.map((interest, index) => (
                  <Chip key={index} label={interest} size="small" />
                ))}
              </Box>
            </Box>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/profile'}
              size="small"
            >
              Customize Persona
            </Button>
          </Paper>
        </Grid>

        {/* Memory Profile */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Memory Profile
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadMemories}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            
            {dashboardData?.memoryProfile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Interaction: {dashboardData.memoryProfile.lastInteraction ? 
                    format(new Date(dashboardData.memoryProfile.lastInteraction), 'PPp') : 
                    'Never'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Emotional State: {dashboardData.memoryProfile.emotionalState || 'Neutral'}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setClearMemoriesDialog(true)}
                size="small"
              >
                Clear Memories
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Memories */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Memories ({memories.length})
            </Typography>
            
            {memories.length === 0 ? (
              <Alert severity="info">
                No memories stored yet. Start chatting to build your AI's memory!
              </Alert>
            ) : (
              <List>
                {memories.slice(0, 10).map((memory, index) => (
                  <React.Fragment key={memory.id}>
                    <MemoryItem memory={memory} />
                    {index < Math.min(memories.length, 10) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Clear Memories Dialog */}
      <Dialog
        open={clearMemoriesDialog}
        onClose={() => setClearMemoriesDialog(false)}
      >
        <DialogTitle>Clear All Memories?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete all stored memories and conversation history. 
            Your AI companion will start fresh with no memory of previous interactions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearMemoriesDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleClearMemories}
            color="error"
            disabled={clearingMemories}
          >
            {clearingMemories ? <CircularProgress size={20} /> : 'Clear All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;