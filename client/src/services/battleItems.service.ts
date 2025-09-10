import apiClient from '../lib/axios';

// This should match the prisma schema enum
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
  expiryDate: string; // e.g., 'YYYY-MM-DDTHH:mm:ss.sssZ'
}

const battleItemService = {
  getItemsForListener: (listenerId: number) => {
    return apiClient.get<BattleItem[]>(`/listeners/${listenerId}/items`);
  },

  createBattleItem: (payload: CreateBattleItemPayload) => {
    return apiClient.post<BattleItem>('/battle-items', payload);
  },
};

export default battleItemService;
