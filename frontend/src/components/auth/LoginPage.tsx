import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/login`, { password });
      login(response.data.token);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => 
          theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)'
            : 'linear-gradient(45deg, #f5f5f7 30%, #ffffff 90%)',
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 4,
              backgroundColor: 'background.glass',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <MusicNoteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            </motion.div>
            
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Welcome
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Enter your password to access your Spotify stats
            </Typography>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ width: '100%' }}
                >
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOpenIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Explore Stats'}
              </Button>
            </Box>
          </Paper>
        </motion.div>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} Personal Spotify Stats. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
