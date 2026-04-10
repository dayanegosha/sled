import { api } from './api';

export const profileService = {
  me: () => api.get('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  updateMe: (data: { display_name?: string; username?: string; bio?: string }) =>
    api.patch('/users/me', data).then((r) => r.data?.data ?? r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api
      .post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data?.data ?? r.data);
  },
};
