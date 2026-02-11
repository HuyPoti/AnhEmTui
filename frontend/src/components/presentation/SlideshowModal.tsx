'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePresentationStore } from '@/stores/presentationStore';
import { useTreeStore } from '@/stores/treeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { X, ChevronLeft, ChevronRight, Fingerprint, Search, ShieldAlert, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SlideshowModal() {
    const { isOpen, currentIndex, closePresentation, next, prev } = usePresentationStore();
    const { nodes } = useTreeStore();
    const { t, language } = useLanguageStore();

    const members = nodes.map(n => n.data);
    const currentMember = members[currentIndex];

    if (!isOpen || !currentMember) return null;

    const handleNext = () => next(members.length);
    const handlePrev = () => {
        const newIdx = (currentIndex - 1 + members.length) % members.length;
        usePresentationStore.setState({ currentIndex: newIdx });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10 overflow-hidden">
                {/* Cinematic Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closePresentation}
                    className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                />

                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600/50 animate-pulse" />
                    <div className="absolute inset-0 grid grid-cols-12 gap-0 border-x border-red-900/20">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="border-r border-red-900/20 h-full" />
                        ))}
                    </div>
                </div>

                {/* Content Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="relative w-full max-w-5xl md:h-[80vh] bg-zinc-950 border-2 md:border-4 border-zinc-800 shadow-[0_0_100px_rgba(220,38,38,0.2)] rounded-lg overflow-y-auto md:overflow-hidden flex flex-col md:flex-row mx-2 md:mx-0"
                >
                    {/* Header Bar */}
                    <div className="sticky top-0 left-0 right-0 h-10 md:h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
                        <div className="flex items-center gap-2 md:gap-3">
                            <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-pulse" />
                            <span className="text-[8px] md:text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                {t('presentation.status')}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                            <span className="hidden sm:block text-[8px] md:text-[10px] font-mono text-zinc-600">ID: {currentMember.id.slice(0, 8)}</span>
                            <button onClick={closePresentation} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Area (Scanner Look) */}
                    <div className="w-full md:w-72 lg:w-80 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4 md:p-6 pt-14 md:pt-16 flex flex-col gap-6 md:gap-8 shrink-0">
                        <div className="relative group max-w-[200px] md:max-w-none mx-auto w-full">
                            <div className="aspect-square bg-zinc-950 border-2 border-zinc-800 overflow-hidden relative">
                                {/* Scan Line Animation */}
                                <motion.div
                                    initial={{ top: '0%' }}
                                    animate={{ top: '100%' }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] z-10"
                                />
                                {currentMember.photoUrl ? (
                                    <img src={currentMember.photoUrl} alt={currentMember.fullName} className="w-full h-full object-cover grayscale contrast-125" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <Search className="w-10 h-10 md:w-12 md:h-12 text-zinc-800" />
                                    </div>
                                )}
                                {/* Red Corner Accents */}
                                <div className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-red-600" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-red-600" />
                            </div>
                            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-950/20 border border-red-900/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Fingerprint className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                                    <span className="text-[8px] md:text-[10px] font-mono text-red-400 font-bold uppercase">DNA MATCHED</span>
                                </div>
                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: '98%' }}
                                        className="h-full bg-red-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:flex md:flex-col gap-3 md:gap-4">
                            <div>
                                <label className="text-[8px] md:text-[9px] font-mono text-zinc-500 uppercase">{t('member.gender')}</label>
                                <p className="text-[10px] md:text-sm font-bold text-white uppercase tracking-wider">
                                    {currentMember.gender === 'male' ? t('member.gender.male') : t('member.gender.female')}
                                </p>
                            </div>
                            <div>
                                <label className="text-[8px] md:text-[9px] font-mono text-zinc-500 uppercase">{t('member.job')}</label>
                                <p className="text-[10px] md:text-sm font-bold text-white uppercase tracking-wider truncate">{currentMember.job || '---'}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[8px] md:text-[9px] font-mono text-zinc-500 uppercase">{t('member.is_alive')}</label>
                                <p className={cn(
                                    "text-[10px] md:text-sm font-bold uppercase tracking-wider",
                                    currentMember.isAlive ? "text-green-500" : "text-red-500"
                                )}>
                                    {currentMember.isAlive ? t('member.alive') : t('member.deceased')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Info Area */}
                    <div className="flex-1 p-4 md:p-8 pt-6 md:pt-20 flex flex-col min-h-[400px] md:min-h-0">
                        <div className="mb-6 md:mb-12">
                            <div className="flex items-center gap-3 md:gap-4 mb-2">
                                <Target className="w-6 h-6 md:w-8 md:h-8 text-red-600 shrink-0" />
                                <h1 className="text-2xl md:text-6xl font-black text-white uppercase tracking-tighter italic break-words">
                                    {currentMember.fullName}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-1.5 md:px-2 py-0.5 bg-red-600 text-[8px] md:text-[10px] font-bold text-white italic">CODE: {currentMember.alias || 'UNKNOWN'}</div>
                                <div className="h-0.5 flex-1 bg-red-900/30" />
                            </div>
                        </div>

                        <div className="flex-1 relative mb-6">
                            <div className="absolute -left-3 md:-left-4 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-red-600 via-transparent to-transparent opacity-50" />
                            <div className="space-y-4 md:space-y-6">
                                <div>
                                    <h3 className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase mb-2">{language === 'vi' ? 'Mô tả lý lịch' : 'Background File'}</h3>
                                    <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed max-w-2xl">
                                        {currentMember.description || (language === 'vi' ? 'DỮ LIỆU ĐANG ĐƯỢC CẬP NHẬT...' : 'DATA BEING UPDATED...')}
                                    </p>
                                </div>
                            </div>

                            {/* Big Stamp */}
                            <motion.div
                                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                                animate={{ scale: 1, opacity: 0.1, rotate: -15 }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-4 right-4 md:bottom-10 md:right-10 border-4 md:border-8 border-red-600 p-2 md:p-4 text-3xl md:text-7xl font-black text-red-600 rotate-[-15deg] select-none pointer-events-none opacity-10"
                            >
                                {t('presentation.revealed')}
                            </motion.div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 md:pt-8 border-t border-zinc-900 sticky bottom-0 bg-zinc-950 pb-4 md:pb-0 z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrev}
                                    className="p-2 md:p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition-all group"
                                >
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-active:scale-95" />
                                </button>
                                <span className="text-zinc-600 font-mono text-[10px] md:text-sm uppercase whitespace-nowrap">Subject {currentIndex + 1} / {members.length}</span>
                                <button
                                    onClick={handleNext}
                                    className="p-2 md:p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition-all group"
                                >
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-active:scale-95" />
                                </button>
                            </div>
                            <button
                                onClick={closePresentation}
                                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] rounded transition-all shadow-lg active:scale-95"
                            >
                                TERMINATE
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
