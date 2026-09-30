import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  completed: Record<string, boolean>;
  toggleCompleted: (id: string) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      toggleCompleted: (id) =>
        set((state) => ({
          completed: { ...state.completed, [id]: !state.completed[id] },
        })),
    }),
    {
      name: 'progress-storage', // name of item in the storage (must be unique)
    }
  )
);
