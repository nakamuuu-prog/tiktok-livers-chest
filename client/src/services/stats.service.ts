import api from '../lib/axios';

export const getDashboardStats = async () => {
  const response = await api.get('/stats/dashboard');
  return response.data;
};

export const getItemsSummary = async () => {
  const response = await api.get('/stats/items-summary');
  return response.data;
};
