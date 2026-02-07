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
    const { t } = useLanguageStore();

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
                    className="relative w-full max-w-5xl aspect-video md:aspect-[16/10] bg-zinc-950 border-4 border-zinc-800 shadow-[0_0_100px_rgba(220,38,38,0.2)] rounded-lg overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Header Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-10">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                            <span className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">
                                {t('presentation.status')}
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="hidden md:block text-[10px] font-mono text-zinc-600">ID: {currentMember.id.slice(0, 8)}</span>
                            <button onClick={closePresentation} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Area (Scanner Look) */}
                    <div className="w-full md:w-80 bg-zinc-900/50 border-r border-zinc-800 p-6 pt-16 flex flex-col gap-8">
                        <div className="relative group">
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
                                        <Search className="w-12 h-12 text-zinc-800" />
                                    </div>
                                )}
                                {/* Red Corner Accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600" />
                            </div>
                            <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Fingerprint className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-mono text-red-400 font-bold">DNA MATCHED</span>
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

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase">{t('member.gender')}</label>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">
                                    {currentMember.gender === 'male' ? t('member.gender.male') : t('member.gender.female')}
                                </p>
                            </div>
                            <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase">{t('member.job')}</label>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{currentMember.job || '---'}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase">{t('member.is_alive')}</label>
                                <p className={cn(
                                    "text-sm font-bold uppercase tracking-wider",
                                    currentMember.isAlive ? "text-green-500" : "text-red-500"
                                )}>
                                    {currentMember.isAlive ? t('member.alive') : t('member.deceased')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Info Area */}
                    <div className="flex-1 p-8 pt-20 flex flex-col">
                        <div className="mb-12">
                            <div className="flex items-center gap-4 mb-2">
                                <Target className="w-8 h-8 text-red-600" />
                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
                                    {currentMember.fullName}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 bg-red-600 text-[10px] font-bold text-white italic">CODE: {currentMember.alias || 'UNKNOWN'}</div>
                                <div className="h-0.5 flex-1 bg-red-900/30" />
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 via-transparent to-transparent opacity-50" />
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-mono text-zinc-500 uppercase mb-2">Mô tả lý lịch / Background File</h3>
                                    <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl">
                                        {currentMember.description || 'DỮ LIỆU ĐANG ĐƯỢC CẬP NHẬT TRANG HỆ THỐNG TRÌNH CHIẾU... QUY TRÌNH XÁC MINH NHÂN THÂN ĐANG DIỄN RA.'}
                                    </p>
                                </div>
                            </div>

                            {/* Big Stamp */}
                            <motion.div
                                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                                animate={{ scale: 1, opacity: 0.1, rotate: -15 }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-10 right-10 border-8 border-red-600 p-4 text-7xl font-black text-red-600 rotate-[-15deg] select-none pointer-events-none"
                            >
                                {t('presentation.revealed')}
                            </motion.div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-zinc-900">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrev}
                                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition-all group"
                                >
                                    <ChevronLeft className="w-6 h-6 group-active:scale-95" />
                                </button>
                                <span className="text-zinc-600 font-mono text-sm uppercase">Subject {currentIndex + 1} / {members.length}</span>
                                <button
                                    onClick={handleNext}
                                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition-all group"
                                >
                                    <ChevronRight className="w-6 h-6 group-active:scale-95" />
                                </button>
                            </div>
                            <button
                                onClick={closePresentation}
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-[0.2em] rounded transition-all"
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
