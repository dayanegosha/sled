"use client";

import { useEffect } from 'react';
import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let active = true;
    setLoading(true);

    profileService
      .me()
      .then((r) => {
        if (!active) return;
        setUser(r?.data ?? null);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setLoading, setUser]);
};
