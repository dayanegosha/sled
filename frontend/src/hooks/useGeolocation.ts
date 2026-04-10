"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useTrackStore } from '@/stores/trackStore';
import { addGpsPoint, getAllPoints, deletePoints, getPointCount } from '@/lib/idb-track-buffer';
import { tracksService } from '@/services/tracks.service';

const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 15_000;

export const useGeolocation = () => {
  const addPoint = useTrackStore((s) => s.addPoint);
  const setTracking = useTrackStore((s) => s.setTracking);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flushToServer = useCallback(async () => {
    try {
      const entries = await getAllPoints();
      if (entries.length === 0) return;

      const points = entries.map((e) => ({
        lat: e.value.lat,
        lng: e.value.lng,
        accuracy: e.value.accuracy,
        timestamp: e.value.timestamp,
      }));

      await tracksService.uploadBatch(points);
      await deletePoints(entries.map((e) => e.key));
    } catch {
      // Points stay in IndexedDB for later sync
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    setTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };

        addPoint(point);

        try {
          await addGpsPoint(point);
          const count = await getPointCount();
          if (count >= FLUSH_THRESHOLD) {
            void flushToServer();
          }
        } catch {
          // IndexedDB unavailable -- points live in memory only
        }
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    flushTimerRef.current = setInterval(() => {
      void flushToServer();
    }, FLUSH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void flushToServer();
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready
            .then((reg) => (reg as any).sync?.register('flush-gps'))
            .catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setTracking(false);
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [addPoint, flushToServer, setTracking]);
};
