import type { AxiosResponse } from 'axios';
import { api } from './api';

function unwrap<T>(r: AxiosResponse): T {
  const body = r.data as { data?: T; success?: boolean };
  return (body?.data ?? body) as T;
}

export type CommunityPost = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  locationName: string | null;
  location: { lat: number; lng: number } | null;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export const communityService = {
  list: () => api.get('/posts').then((r) => unwrap<{ items: CommunityPost[] }>(r)),

  create: (body: {
    content: string;
    lat?: number;
    lng?: number;
    locationName?: string;
  }) => api.post('/posts', body).then((r) => unwrap(r)),

  report: (postId: string, reason?: string) =>
    api.post(`/posts/${postId}/report`, { reason }).then((r) => unwrap(r)),
};
