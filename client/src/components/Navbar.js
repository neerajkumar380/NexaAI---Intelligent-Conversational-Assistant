import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip
} from '@mui/material';
import {
  SmartToy as BotIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <BotIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" component="div" color="primary">
            AI Chat
          </Typography>
          
          <Box sx={{ ml: 4, display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ChatIcon />}
              onClick={() => navigate('/chat')}
              variant={isActive('/chat') ? 'contained' : 'text'}
              size="small"
            >
              Chat
            </Button>
            <Button
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              variant={isActive('/dashboard') ? 'contained' : 'text'}
              size="small"
            >
              Dashboard
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<BotIcon />}
            label={user?.chatbotPersona?.name || 'Alex'}
            size="small"
            variant="outlined"
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {user?.profile?.name || user?.username}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleNavigation('/profile')}>
                <SettingsIcon sx={{ mr: 1 }} />
                Profile & Settings
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/dashboard')}>
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;