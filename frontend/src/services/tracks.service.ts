import { api } from './api';

export const tracksService = {
  uploadBatch: (
    points: Array<{
      lat: number;
      lng: number;
      accuracy?: number;
      timestamp?: number;
    }>,
  ) => api.post('/tracks/batch', { points }).then((r) => r.data),

  getRevealed: () => api.get('/tracks/revealed').then((r) => r.data),

  getStats: () => api.get('/tracks/stats').then((r) => r.data),
};
