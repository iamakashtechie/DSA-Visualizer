import { create } from 'zustand'

interface ProgressState {
  completed: Record<string, boolean>
  toggleCompleted: (id: string) => void
}

export const useProgressStore = create<ProgressState>((set) => ({
  completed: {},
  toggleCompleted: (id) => set((state) => ({
    completed: { ...state.completed, [id]: !state.completed[id] }
  }))
}))
