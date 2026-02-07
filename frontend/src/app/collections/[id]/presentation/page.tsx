'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Fingerprint, Search,
    ShieldAlert, Target, Loader2, ArrowLeft, Ghost,
    LayoutGrid, Network, Users, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';

export default function CollectionPresentationPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguageStore();
    const [collection, setCollection] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/collections/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCollection(data);
                } else {
                    setError('Archive access denied: Collection not found');
                }
            } catch (err) {
                console.error(err);
                setError('Archive synchronization failed: Server unreachable');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollection();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4 font-mono">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <p className="text-[10px] uppercase font-black text-slate-500 animate-pulse tracking-[0.3em]">
                    {t('collections.accessing')}
                </p>
            </div>
        );
    }

    if (error || !collection || !collection.cards || collection.cards.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center font-mono">
                <ShieldAlert className="w-16 h-16 text-red-900/50 mb-6 animate-pulse" />
                <h1 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter italic">Intelligence Failure</h1>
                <p className="text-slate-500 mb-8 max-w-md text-xs uppercase tracking-widest leading-relaxed">
                    {error || 'This digital archive contains no valid intelligence data or character records.'}
                </p>
                <button
                    onClick={() => router.push('/collections')}
                    className="flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-zinc-800 text-cyan-500 text-[10px] font-black uppercase rounded-xl hover:bg-cyan-500 hover:text-black transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Registry
                </button>
            </div>
        );
    }

    const currentCard = collection.cards[currentIndex];
    const totalCards = collection.cards.length;

    const next = () => setCurrentIndex((prev) => (prev + 1) % totalCards);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-mono relative overflow-x-hidden">
            {/* Cinematic Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />

            {/* Background Grid */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-600/50 animate-pulse" />
                <div className="absolute inset-0 grid grid-cols-12 gap-0 border-x border-cyan-900/20">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border-r border-cyan-900/20 h-full" />
                    ))}
                </div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.id}
                        initial={{ scale: 0.95, opacity: 0, x: 20 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 1.05, opacity: 0, x: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 100 }}
                        className="relative w-full max-w-6xl md:h-[650px] bg-zinc-950 border border-zinc-900 shadow-[0_0_100px_rgba(8,145,178,0.1)] rounded-3xl overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Top Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-[10px] font-mono text-cyan-500/80 uppercase tracking-[0.3em]">
                                    {t('collections.status_active')}
                                </span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="hidden sm:block text-[9px] font-mono text-zinc-600 uppercase tracking-widest truncate max-w-[150px]">Archive: {collection.name}</span>
                                <button onClick={() => setIsNetworkModalOpen(true)} className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 rounded-lg hover:bg-cyan-500/20 transition-all flex items-center gap-2" title="View Network Map">
                                    <Network className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Network Map</span>
                                </button>
                                <button onClick={() => router.push('/collections')} className="text-zinc-500 hover:text-white transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Left Section: Visual Assets */}
                        <div className="w-full md:w-[400px] bg-zinc-900/10 border-r border-zinc-900 md:p-8 p-4 pt-16 md:pt-16 flex flex-col shrink-0 min-h-0">
                            <div className="relative group aspect-[3/4] md:aspect-auto md:flex-1 min-h-0">
                                <div className="w-full h-full bg-zinc-950 border border-zinc-900 overflow-hidden relative rounded-2xl shadow-inner">
                                    <motion.div
                                        initial={{ top: '0%' }}
                                        animate={{ top: '100%' }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                        className="absolute left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)] z-10"
                                    />
                                    <img
                                        src={currentCard.photoUrl}
                                        alt={currentCard.characterName}
                                        className="w-full h-full object-cover contrast-110 brightness-90 transition-all duration-1000"
                                    />
                                    {/* Corner Accents */}
                                    <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-cyan-500/50" />
                                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-cyan-500/50" />
                                </div>
                            </div>

                            <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-zinc-900/30 p-3 md:p-4 border border-zinc-900 rounded-2xl">
                                    <label className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1 block">Rarity Class</label>
                                    <p className={cn(
                                        "text-[10px] md:text-xs font-black uppercase tracking-tighter",
                                        currentCard.rarity === 'legendary' ? 'text-amber-500' :
                                            currentCard.rarity === 'epic' ? 'text-purple-500' :
                                                currentCard.rarity === 'rare' ? 'text-cyan-500' : 'text-slate-400'
                                    )}>
                                        {currentCard.rarity || 'Common'}
                                    </p>
                                </div>
                                <div className="bg-zinc-900/30 p-3 md:p-4 border border-zinc-900 rounded-2xl flex flex-col justify-center">
                                    <label className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1 block">Authentication</label>
                                    <div className="flex items-center gap-2">
                                        <Fingerprint className="w-3 h-3 text-cyan-500" />
                                        <span className="text-[10px] font-black text-white uppercase italic">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Intel & Registry */}
                        <div className="flex-1 p-6 md:p-12 pt-10 md:pt-20 flex flex-col relative min-h-0">
                            <div className="mb-6 md:mb-10 shrink-0">
                                <div className="flex items-center gap-4 mb-3 md:mb-4">
                                    <Target className="w-8 h-8 md:w-10 md:h-10 text-cyan-700/50" />
                                    <h2 className="text-[9px] md:text-[10px] font-mono text-cyan-600 uppercase tracking-[0.5em]">{t('collections.id_card')}</h2>
                                </div>
                                <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none mb-4 break-words">
                                    {currentCard.characterName}
                                </h1>
                                <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 bg-cyan-600/5 border border-cyan-500/10 text-cyan-500/80 rounded-full">
                                    <Ghost className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">{currentCard.name}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Users className="w-3 h-3" />
                                                Relationship intel / Network
                                            </h3>
                                            <div className="space-y-3">
                                                {(() => {
                                                    const relations = collection.relations?.filter((r: any) => r.sourceCardId === currentCard.id || r.targetCardId === currentCard.id) || [];
                                                    if (relations.length === 0) return <p className="text-[10px] text-zinc-600 uppercase italic">No active connections detected in this archive.</p>;

                                                    return relations.map((rel: any) => {
                                                        const isSource = rel.sourceCardId === currentCard.id;
                                                        const otherId = isSource ? rel.targetCardId : rel.sourceCardId;
                                                        const otherCard = collection.cards.find((c: any) => c.id === otherId);
                                                        const otherIndex = collection.cards.findIndex((c: any) => c.id === otherId);

                                                        return (
                                                            <div
                                                                key={rel.id}
                                                                className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:border-cyan-500/30 transition-all cursor-pointer group/rel"
                                                                onClick={() => setCurrentIndex(otherIndex)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden shrink-0">
                                                                        <img src={otherCard?.photoUrl} alt="" className="w-full h-full object-cover grayscale group-hover/rel:grayscale-0 transition-all" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-white font-black uppercase tracking-tight">{otherCard?.characterName}</p>
                                                                        <p className="text-[8px] text-cyan-500/60 uppercase font-black">{rel.relationType}</p>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover/rel:text-cyan-500 transition-colors" />
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Search className="w-3 h-3" />
                                                Field Notes / Archive Brief
                                            </h3>
                                            <p className="text-zinc-500 font-mono text-xs md:text-sm leading-relaxed border-l border-zinc-800 pl-4 py-1 italic bg-zinc-900/10 rounded-r-lg">
                                                Intelligence gathered from archive files suggests this agent holds significant tactical importance.
                                                Appearance reported in multiple high-level operations within the {collection.name} timeline.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 md:gap-8 pt-2">
                                            <div>
                                                <span className="block text-[8px] font-mono text-zinc-700 uppercase mb-1 tracking-widest">Index ID</span>
                                                <span className="font-mono text-[10px] md:text-xs text-zinc-400">#{currentCard.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] font-mono text-zinc-700 uppercase mb-1 tracking-widest">Entry Date</span>
                                                <span className="font-mono text-[10px] md:text-xs text-zinc-400">{new Date(collection.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex flex-col justify-end items-end opacity-[0.05] pointer-events-none">
                                        <LayoutGrid className="w-48 h-48 text-cyan-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Overlay */}
                            <div className="mt-8 md:mt-auto flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 md:pt-10 border-t border-zinc-900/50">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <button
                                        onClick={prev}
                                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                                    >
                                        <div className="p-3 md:p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition-all active:scale-95 shadow-lg">
                                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <span className="text-[7px] md:text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">Previous</span>
                                    </button>

                                    <div className="flex flex-col items-center gap-2 px-4 md:px-8 min-w-[120px]">
                                        <div className="flex items-center gap-1.5">
                                            {Array.from({ length: Math.min(totalCards, 8) }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-1 transition-all duration-300 rounded-full",
                                                        i === currentIndex % 8 ? "w-6 bg-cyan-600" : "w-1 bg-zinc-800"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-zinc-600 font-mono text-[9px] font-bold tracking-widest uppercase italic">
                                            Docket {currentIndex + 1} / {totalCards}
                                        </span>
                                    </div>

                                    <button
                                        onClick={next}
                                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                                    >
                                        <div className="p-3 md:p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition-all active:scale-95 shadow-lg">
                                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <span className="text-[7px] md:text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">Next File</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => router.push('/collections')}
                                    className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-zinc-900/50 hover:bg-red-950/20 text-zinc-600 hover:text-red-500 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] border border-zinc-800 hover:border-red-900/30 rounded-2xl transition-all shadow-md active:scale-95 focus:outline-none flex items-center justify-center gap-2"
                                >
                                    <ShieldAlert className="w-3 h-3" />
                                    Terminate Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Network View Modal */}
            <AnimatePresence>
                {isNetworkModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNetworkModalOpen(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-7xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_150px_rgba(6,182,212,0.1)]"
                        >
                            <div className="p-8 border-b border-zinc-900 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                                        <Network className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Personnel Network Map</h2>
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.3em]">Archive: {collection.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsNetworkModalOpen(false)} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-12 relative custom-scrollbar bg-[url('https://grain-y.com/grain.png')] bg-repeat opacity-[0.9]">
                                {/* Minimalist Grid visualization */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {collection.cards.map((card: any, idx: number) => {
                                        const cardRelations = collection.relations?.filter((r: any) => r.sourceCardId === card.id || r.targetCardId === card.id) || [];
                                        return (
                                            <motion.div
                                                key={card.id}
                                                whileHover={{ scale: 1.02 }}
                                                className="group relative"
                                            >
                                                <div
                                                    onClick={() => { setCurrentIndex(idx); setIsNetworkModalOpen(false); }}
                                                    className="relative bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 transition-all hover:border-cyan-500/40 cursor-pointer overflow-hidden"
                                                >
                                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border border-zinc-800 grayscale group-hover:grayscale-0 transition-all">
                                                        <img src={card.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <h3 className="text-center text-sm font-black text-white uppercase truncate tracking-tighter">{card.characterName}</h3>
                                                    <p className="text-center text-[8px] text-zinc-600 uppercase font-bold mb-4">{card.name}</p>

                                                    <div className="space-y-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {cardRelations.map((rel: any) => {
                                                            const isSource = rel.sourceCardId === card.id;
                                                            const otherId = isSource ? rel.targetCardId : rel.sourceCardId;
                                                            const other = collection.cards.find((c: any) => c.id === otherId);
                                                            return (
                                                                <div key={rel.id} className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,1)]" />
                                                                    <span className="text-[7px] text-zinc-400 font-bold uppercase truncate">
                                                                        {rel.relationType} → {other?.characterName}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Authentication Stamp */}
                                                    <div className="absolute -bottom-2 -right-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12">
                                                        <Fingerprint className="w-16 h-16 text-cyan-500" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Grain/Distort Effect */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale bg-[url('https://grain-y.com/grain.png')] mix-blend-overlay" />
        </div>
    );
}
