"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Camera, Heart, Share2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';

export default function CollectionsPage() {
    const router = useRouter();
    const { t } = useLanguageStore();
    const [collections, setCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'anime' | 'movie'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/collections`);
                if (res.ok) {
                    const data = await res.json();
                    setCollections(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const filteredCollections = collections.filter(c => {
        const matchesTab = filter === 'all' || c.type === filter;
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white font-special-elite">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter italic">{t('app.title')} Archives</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">{t('admin.nav.collections')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search archives..."
                                className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyan-500/50 outline-none w-full md:w-64 transition-all"
                            />
                        </div>
                        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
                            {(['all', 'anime', 'movie'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                        filter === type ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                        <p className="text-[10px] uppercase font-black text-slate-500 animate-pulse">Accessing Secure Records...</p>
                    </div>
                ) : filteredCollections.length === 0 ? (
                    <div className="text-center py-32 space-y-4">
                        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold uppercase">No records found</h3>
                        <p className="text-slate-500 text-sm">The archives are empty or the search returned no results.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredCollections.map((collection, idx) => (
                            <motion.div
                                key={collection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 transition-all duration-500"
                            >
                                <div className="absolute top-0 right-0 p-6 z-10">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black uppercase text-cyan-400">
                                        {collection.type}
                                    </div>
                                </div>

                                {/* Stacked Cards Preview */}
                                <div className="h-64 relative bg-[#0a0a0a] flex items-center justify-center p-8">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
                                    <AnimatePresence>
                                        {collection.cards?.slice(0, 3).map((card: any, i: number) => (
                                            <motion.div
                                                key={card.id}
                                                style={{
                                                    rotate: i === 0 ? -8 : i === 1 ? 4 : 0,
                                                    x: i === 0 ? '-15%' : i === 1 ? '15%' : 0,
                                                    zIndex: 3 - i
                                                }}
                                                className="absolute w-32 h-44 bg-white p-1 shadow-2xl rounded-sm transform group-hover:scale-110 group-hover:rotate-0 group-hover:x-0 transition-all duration-700"
                                            >
                                                <div className="w-full h-3/4 bg-slate-900 overflow-hidden">
                                                    <img src={card.photoUrl} alt="" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                                                </div>
                                                <div className="mt-2 text-center overflow-hidden">
                                                    <p className="text-[6px] text-black font-black uppercase truncate">{card.characterName}</p>
                                                    <p className="text-[4px] text-slate-500 truncate">{card.rarity || 'Common'}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {(!collection.cards || collection.cards.length === 0) && (
                                        <div className="text-slate-700 flex flex-col items-center gap-2">
                                            <Camera className="w-12 h-12 opacity-20" />
                                            <p className="text-[10px] uppercase font-black italic">No visual data</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase italic group-hover:text-cyan-400 transition-colors">{collection.name}</h3>
                                        <p className="text-slate-500 text-xs font-medium line-clamp-2 mt-2">{collection.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                <span className="text-[10px] font-bold">1.2k</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Share2 className="w-4 h-4" />
                                                <span className="text-[10px] font-bold">428</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/collections/${collection.id}/presentation`)}
                                            className="flex items-center gap-2 px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-full hover:bg-cyan-500 transition-colors"
                                        >
                                            {t('collections.explore')}
                                            <Sparkles className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
