"use client";

import { useEffect, useRef, useState } from 'react';
import DistanceCounter from './DistanceCounter';
import { loadVkMapsApi } from '@/lib/vk-maps';

type Props = {
  fullScreen?: boolean;
};

export default function MapContainer({ fullScreen }: Props) {
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

        const { MMap, MMapDefaultSchemeLayer, MMapDefaultFeaturesLayer } = mappable;

        const mapInstance = new MMap(ref.current, {
          location: {
            center: [37.6176, 55.7558],
            zoom: fullScreen ? 11 : 10,
          },
          theme: 'dark',
        });

        mapInstance.addChild(new MMapDefaultSchemeLayer({}));
        mapInstance.addChild(new MMapDefaultFeaturesLayer({}));

        mapRef.current = mapInstance;
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Map initialization failed';
        setError(msg);
      }
    };

    void init();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [fullScreen]);

  const shellClass = fullScreen
    ? 'relative h-full w-full overflow-hidden bg-black'
    : 'relative h-[72vh] overflow-hidden rounded-3xl border border-white/12 bg-black/30 shadow-2xl';

  return (
    <section className={shellClass}>
      {error ? (
        <div className="flex h-full min-h-[40vh] w-full items-center justify-center px-4 text-center text-sm text-red-200">
          {error}
        </div>
      ) : (
        <div ref={ref} className="absolute inset-0 h-full w-full" />
      )}
      <DistanceCounter fullScreen={!!fullScreen} />
    </section>
  );
}
