import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
  IconButton,
  useTheme,
} from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { REACT_APP_API_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const API_URL = REACT_APP_API_URL || 'http://localhost:3001';

const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="music-note" size={80} color={theme.colors.primary} />
          <Text variant="headlineLarge" style={styles.title}>Welcome</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your password to access your Spotify stats
          </Text>
        </View>

        <Surface style={styles.surface} elevation={2}>
          {error && (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock-outline" color={theme.colors.primary} />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            disabled={loading}
          />

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
        </Surface>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            © {new Date().getFullYear()} Personal Spotify Stats
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fallback, but theme should handle it
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});

export default LoginScreen;
