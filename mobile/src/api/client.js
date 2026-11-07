import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// On web, use localhost. On real devices (later), swap to your LAN IP.
export const API_BASE = 'http://localhost:3000';

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
