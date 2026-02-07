'use client';

import { useState, useEffect } from 'react';
import { GenealogyTree } from "@/components/tree/GenealogyTree";
import { LandingPage } from "@/components/home/LandingPage";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthStore } from "@/stores/authStore";

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
