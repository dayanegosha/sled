import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (v: InternalAxiosRequestConfig) => void;
  reject: (e: AxiosError) => void;
  config: InternalAxiosRequestConfig;
}[] = [];

function processQueue(error: AxiosError | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(p.config);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !originalConfig ||
      originalConfig._retry ||
      originalConfig.url?.includes('/auth/refresh') ||
      originalConfig.url?.includes('/auth/me')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalConfig });
      }).then((cfg) => api(cfg));
    }

    originalConfig._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      processQueue(null);
      return api(originalConfig);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
