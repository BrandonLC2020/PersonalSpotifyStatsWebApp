import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_API_URL } from '@env';

const API_URL = REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Failed to get token from storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      try {
        await AsyncStorage.removeItem('auth_token');
        // Redirection should be handled by the AuthProvider/MainNavigator state change
      } catch (e) {
        console.error('Failed to clear token', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
