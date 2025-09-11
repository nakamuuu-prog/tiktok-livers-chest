import apiClient from '../lib/axios';

// Define interfaces for API responses and request payloads
interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
}

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

  getMe: () => {
    // The token is now automatically added by the axios interceptor
    return apiClient.get<User>('/auth/me');
  },
};

export default authService;
