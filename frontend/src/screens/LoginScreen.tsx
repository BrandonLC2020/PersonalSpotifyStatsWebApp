import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff, MusicNote } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001';

const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

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
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <MusicNote sx={{ fontSize: 80, color: 'primary.main' }} />
        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
          Welcome
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Enter your password to access your Spotify stats
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 4, width: '100%' }}>
        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          InputProps={{
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
          }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          disabled={loading}
          sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
        >
          {loading ? 'Loading...' : 'Explore Stats'}
        </Button>
      </Paper>

      <Box sx={{ mt: 5, mb: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Personal Spotify Stats
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginScreen;