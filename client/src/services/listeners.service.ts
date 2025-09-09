import apiClient from '../lib/axios';

export interface Listener {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const listenerService = {
  getListeners: () => {
    return apiClient.get<Listener[]>('/listeners');
  },

  createListener: (name: string) => {
    return apiClient.post<Listener>('/listeners', { name });
  },
};

export default listenerService;
