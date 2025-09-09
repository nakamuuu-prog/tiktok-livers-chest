import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Define interfaces for API responses and request payloads
interface User {
  id: number;
  username: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// We will expand this with more auth-related functions
const authService = {
  register: (username: string, password: string) => {
    return apiClient.post<AuthResponse>('/auth/register', {
      username,
      password,
    });
  },

  login: (username: string, password: string) => {
    return apiClient.post<AuthResponse>('/auth/login', { username, password });
  },

  checkUsername: (username: string) => {
    return apiClient.post<{ message: string }>('/auth/check-username', {
      username,
    });
  },

  getMe: (token: string) => {
    return apiClient.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default authService;
