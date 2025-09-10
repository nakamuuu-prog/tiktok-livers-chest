import { BattleItem } from './battleItems.service';
import apiClient from '../lib/axios';

export interface Listener {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  activeItemCount: number;
  battleItems: BattleItem[];
}

const listenerService = {
  getListeners: () => {
    return apiClient.get<Listener[]>('/listeners');
  },

  createListener: (name: string) => {
    return apiClient.post<Listener>('/listeners', { name });
  },

  updateListener: (id: number, name: string) => {
    return apiClient.put<Listener>(`/listeners/${id}`, { name });
  },

  deleteListener: (id: number) => {
    return apiClient.delete(`/listeners/${id}`);
  },

  getListenerById: (id: number) => {
    return apiClient.get<Listener>(`/listeners/${id}`);
  },
};

export default listenerService;
