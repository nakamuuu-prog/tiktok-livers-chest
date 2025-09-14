import apiClient from '../lib/axios';

export enum ItemType {
  GLOVE = 'GLOVE',
  STUN_HAMMER = 'STUN_HAMMER',
  MIST = 'MIST',
  TIME = 'TIME',
  SECOND_BOOSTER = 'SECOND_BOOSTER',
  THIRD_BOOSTER = 'THIRD_BOOSTER',
}

export interface BattleItem {
  id: number;
  listenerId: number;
  itemType: ItemType;
  expiryDate: string;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateBattleItemPayload {
  listenerId: number;
  itemType: ItemType;
  expiryDate?: string; // e.g., 'YYYY-MM-DDTHH:mm:ss.sssZ'
}

interface CreateMultipleBattleItemsPayload {
  listenerId: number;
  items: { itemType: ItemType; quantity: number }[];
  expiryDate?: string;
}

interface UpdateBattleItemPayload {
  itemType: ItemType;
  expiryDate: string;
}

const battleItemService = {
  getItemsForListener: (listenerId: number) => {
    return apiClient.get<BattleItem[]>(`/listeners/${listenerId}/items`);
  },

  createBattleItem: (payload: CreateBattleItemPayload) => {
    return apiClient.post<BattleItem>('/battle-items', payload);
  },

  createMultipleBattleItems: (payload: CreateMultipleBattleItemsPayload) => {
    return apiClient.post<BattleItem[]>('/battle-items/bulk', payload);
  },

  updateBattleItem: (id: number, payload: UpdateBattleItemPayload) => {
    return apiClient.put<BattleItem>(`/battle-items/${id}`, payload);
  },


  deleteBattleItem: (id: number) => {
    return apiClient.delete(`/battle-items/${id}`);
  },
};

export default battleItemService;
