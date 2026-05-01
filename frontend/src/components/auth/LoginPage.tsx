import React, { useState } from 'react';
import { Box, CardContent } from '@mui/material';
import { Typography, TextField, InputAdornment, Button, Card, FormHelperText, useTheme, IconButton, Icon } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:3001';

const LoginPage: React.FC = () => {
  const theme = useTheme();
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
    <Box sx={{ ...styles.container,  backgroundColor: theme.palette.background.default  }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ overflowY: "auto", ...styles.scrollContent }}>
            <Box sx={styles.header}>
                <Typography variant="h4" style={styles.title}>Welcome</Typography>
                <Typography variant="body1" sx={styles.subtitle}>
                    Enter your password to access your Spotify stats
                </Typography>
            </Box>

            <Card style={styles.card}>
                <CardContent>
                    <TextField
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        <Icon>{showPassword ? "visibility_off" : "visibility"}</Icon>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        variant="outlined"
                        error={!!error}
                        disabled={loading}
                    />
                    {error && (
                        <FormHelperText error={!!error}>
                            {error}
                        </FormHelperText>
                    )}

                    <Button 
                        variant="contained" 
                        onClick={handleLogin} 
                        
                        disabled={loading}
                        style={styles.button}
                        
                    >
                        Explore Stats
                    </Button>
                </CardContent>
            </Card>

            <Box sx={styles.footer}>
                <Typography variant="caption" style={styles.footerText}>
                    &copy; {new Date().getFullYear()} Personal Spotify Stats
                </Typography>
            </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 4,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.5,
  }
};

export default LoginPage;
