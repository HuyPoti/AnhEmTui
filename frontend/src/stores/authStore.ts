import { create } from 'zustand';
import { useTreeStore } from './treeStore';

interface User {
    id: string;
    email: string;
    fullName: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    authView: 'login' | 'register' | 'forgot-password' | 'verify-email';

    setUser: (user: User | null, token?: string | null) => void;
    openAuthModal: (view?: 'login' | 'register' | 'forgot-password' | 'verify-email') => void;
    closeAuthModal: () => void;
    setAuthView: (view: 'login' | 'register' | 'forgot-password' | 'verify-email') => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
    isAuthModalOpen: false,
    authView: 'login',

    setUser: (user, token) => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');

        if (token) {
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true });
        } else {
            localStorage.removeItem('token');
            set({ user, token: null, isAuthenticated: false });
        }
    },
    openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    setAuthView: (view) => set({ authView: view }),
    logout: () => {
        if (typeof window !== 'undefined') {
            // Reset tree state to default to prevent re-saving old data
            try {
                useTreeStore.getState().createNewTree();
                useTreeStore.persist.clearStorage();
            } catch (e) {
                console.error('Error clearing tree storage:', e);
            }

            localStorage.clear(); // Wipe everything
            sessionStorage.clear();
        }
        set({ user: null, token: null, isAuthenticated: false });

        if (typeof window !== 'undefined') {
            window.location.reload(); // Force reload
        }
    },
}));
