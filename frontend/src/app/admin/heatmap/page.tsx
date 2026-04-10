"use client";

import { useEffect, useRef, useState } from 'react';
import { loadVkMapsApi } from '@/lib/vk-maps';

export default function AdminHeatmapPage() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ destroy: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!ref.current) return;
        const mappable = await loadVkMapsApi();
        if (cancelled || !ref.current) return;

        const { MMap, MMapDefaultSchemeLayer, MMapDefaultFeaturesLayer } =
          mappable;

        const mapInstance = new MMap(ref.current, {
          location: {
            center: [37.6176, 55.7558],
            zoom: 4,
          },
          theme: 'dark',
        });

        mapInstance.addChild(new MMapDefaultSchemeLayer({}));
        mapInstance.addChild(new MMapDefaultFeaturesLayer({}));

        mapRef.current = mapInstance;
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Map init failed');
      }
    };

    void init();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="text-2xl font-semibold tracking-tight">Карта активности</h2>
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div ref={ref} className="absolute inset-0" />
        )}
      </div>
    </div>
  );
}
