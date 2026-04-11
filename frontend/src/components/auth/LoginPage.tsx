import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText, useTheme } from 'react-native-paper';
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text variant="displaySmall" style={styles.title}>Welcome</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Enter your password to access your Spotify stats
                </Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        right={
                            <TextInput.Icon 
                                icon={showPassword ? "eye-off" : "eye"} 
                                onPress={() => setShowPassword(!showPassword)} 
                            />
                        }
                        mode="outlined"
                        error={!!error}
                        disabled={loading}
                    />
                    {error && (
                        <HelperText type="error" visible={!!error}>
                            {error}
                        </HelperText>
                    )}

                    <Button 
                        mode="contained" 
                        onPress={handleLogin} 
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Explore Stats
                    </Button>
                </Card.Content>
            </Card>

            <View style={styles.footer}>
                <Text variant="labelSmall" style={styles.footerText}>
                    &copy; {new Date().getFullYear()} Personal Spotify Stats
                </Text>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    textAlign: 'center',
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
});

export default LoginPage;
