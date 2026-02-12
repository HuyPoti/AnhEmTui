'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthStore } from "@/stores/authStore";

const GenealogyTree = dynamic(() => import('@/components/tree/GenealogyTree').then(mod => mod.GenealogyTree), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full bg-slate-950 text-cyan-500">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  )
});

const LandingPage = dynamic(() => import('@/components/home/LandingPage').then(mod => mod.LandingPage), {
  loading: () => <div className="min-h-screen bg-slate-950" />
});

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      setShowApp(true);
    }
  }, [isAuthenticated]);

  return (
    <main className="w-full h-full overflow-hidden">
      {showApp ? (
        <GenealogyTree onExit={() => setShowApp(false)} />
      ) : (
        <LandingPage onStartDemo={() => setShowApp(true)} />
      )}
      <AuthModal />
    </main>
  );
}
