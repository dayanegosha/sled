"use client";
import { useEffect } from 'react';
import { tracksService } from '@/services/tracks.service';
import { useRevealStore } from '@/stores/revealStore';

export const useRevealEngine = () => {
  const setGeojson = useRevealStore((s) => s.setGeojson);
  useEffect(() => {
    tracksService.getRevealed().then((r) => setGeojson(r.data ?? r)).catch(() => undefined);
  }, [setGeojson]);
};
