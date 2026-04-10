import { api } from './api';

export const friendsService = {
  list: () => api.get('/friendships').then((r) => r.data?.data ?? r.data),
  requests: () => api.get('/friendships/requests').then((r) => r.data?.data ?? r.data),
  search: (q: string) =>
    api.get(`/friendships/search?q=${encodeURIComponent(q)}`).then((r) => r.data?.data ?? r.data),
  send: (userId: string) => api.post(`/friendships/${userId}`).then((r) => r.data),
  respond: (userId: string, action: 'accept' | 'reject') =>
    api.patch(`/friendships/${userId}`, { action }).then((r) => r.data),
  remove: (userId: string) => api.delete(`/friendships/${userId}`).then((r) => r.data),
  compare: (userId: string) =>
    api.get(`/friendships/compare/${userId}`).then((r) => r.data?.data ?? r.data),
  importVk: () => api.post('/friendships/import-vk').then((r) => r.data?.data ?? r.data),
};
