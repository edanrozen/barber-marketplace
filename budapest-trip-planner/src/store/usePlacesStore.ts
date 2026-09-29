import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Place, PlaceStatus } from '@/types';
import { PLACES_SEED } from '@/data/places.seed';
import { makeId } from '@/lib/id';

interface PlacesState {
  places: Place[];
  addPlace: (place: Omit<Place, 'id' | 'visited' | 'status'> & Partial<Pick<Place, 'id' | 'visited' | 'status'>>) => Place;
  updatePlace: (id: string, patch: Partial<Place>) => void;
  setStatus: (id: string, status: PlaceStatus) => void;
  toggleVisited: (id: string) => void;
  toggleSaved: (id: string) => void;
  removePlace: (id: string) => void;
}

export const usePlacesStore = create<PlacesState>()(
  persist(
    (set, get) => ({
      places: PLACES_SEED,

      addPlace: (place) => {
        const created: Place = {
          visited: false,
          status: 'AVAILABLE',
          ...place,
          id: place.id ?? makeId('place'),
        };
        set({ places: [...get().places, created] });
        return created;
      },

      updatePlace: (id, patch) => {
        set({
          places: get().places.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        });
      },

      setStatus: (id, status) => {
        get().updatePlace(id, status === 'DONE' ? { status, visited: true } : { status });
      },

      toggleVisited: (id) => {
        const place = get().places.find((p) => p.id === id);
        if (!place) return;
        get().updatePlace(id, { visited: !place.visited });
      },

      toggleSaved: (id) => {
        const place = get().places.find((p) => p.id === id);
        if (!place) return;
        get().updatePlace(id, { saved: !place.saved });
      },

      removePlace: (id) => {
        set({ places: get().places.filter((p) => p.id !== id) });
      },
    }),
    { name: 'budapest-trip-planner:places' },
  ),
);
