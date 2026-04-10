import { create } from 'zustand';
export const useRevealStore = create<{ geojson: any; setGeojson: (g: any) => void }>((set) => ({ geojson: null, setGeojson: (geojson) => set({ geojson }) }));
