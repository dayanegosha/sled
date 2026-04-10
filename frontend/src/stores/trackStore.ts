import { create } from 'zustand';
import type { GpsPoint } from '@/lib/idb-track-buffer';

type TrackState = {
  points: GpsPoint[];
  totalDistance: number;
  isTracking: boolean;
  addPoint: (p: GpsPoint) => void;
  setPoints: (pts: GpsPoint[]) => void;
  setTotalDistance: (d: number) => void;
  setTracking: (v: boolean) => void;
};

export const useTrackStore = create<TrackState>((set) => ({
  points: [],
  totalDistance: 0,
  isTracking: false,
  addPoint: (p) => set((s) => ({ points: [...s.points, p] })),
  setPoints: (pts) => set({ points: pts }),
  setTotalDistance: (d) => set({ totalDistance: d }),
  setTracking: (v) => set({ isTracking: v }),
}));
