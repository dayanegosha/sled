"use client";

import MapContainer from '@/components/map/MapContainer';

export default function MapPage() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <MapContainer fullScreen />
    </div>
  );
}
