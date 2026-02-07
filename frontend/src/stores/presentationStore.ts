import { create } from 'zustand';

interface PresentationState {
    isOpen: boolean;
    currentIndex: number;
    openPresentation: (startIndex?: number) => void;
    closePresentation: () => void;
    next: (total: number) => void;
    prev: () => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
    isOpen: false,
    currentIndex: 0,
    openPresentation: (startIndex = 0) => set({ isOpen: true, currentIndex: startIndex }),
    closePresentation: () => set({ isOpen: false }),
    next: (total) => set((state) => ({
        currentIndex: (state.currentIndex + 1) % total
    })),
    prev: () => set((state) => ({
        currentIndex: (state.currentIndex - 1 + 1000) % 1000 // Temporary logic, handled better in component
    })),
}));
