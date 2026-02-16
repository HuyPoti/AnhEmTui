'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePresentationStore } from '@/stores/presentationStore';
import { useTreeStore } from '@/stores/treeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { X, ChevronLeft, ChevronRight, Fingerprint, Users, ShieldAlert, Target } from 'lucide-react';
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
                {/* Soft Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closePresentation}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                />

                {/* Content Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-5xl md:h-[85vh] bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row mx-2 md:mx-0"
                >
                    {/* Top Decorative bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 z-30" />

                    {/* Left Sidebar: Polaroid & Key Stats */}
                    <div className="w-full md:w-80 bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-700/50 p-6 md:p-8 flex flex-col gap-8 shrink-0 z-10">
                        <div className="relative group mx-auto w-full max-w-[240px] md:max-w-none">
                            {/* Polaroid Frame */}
                            <div className="bg-[#f0ece2] p-3 pb-10 shadow-[5px_5px_15px_rgba(0,0,0,0.5)] transform -rotate-1 transition-transform hover:rotate-0 duration-500 border border-[#d1cfc7]">
                                <div className="aspect-[4/5] bg-slate-950 overflow-hidden relative border border-black/10">
                                    {currentMember.photoUrl ? (
                                        <motion.img
                                            key={currentIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            src={currentMember.photoUrl}
                                            alt={currentMember.fullName}
                                            className="w-full h-full object-cover sepia-[0.1] contrast-[1.05]"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://ui-avatars.com/api/?background=1a1a1a&color=fff&name=' + currentMember.fullName;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <Users className="w-12 h-12 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                                {/* Label area on polaroid */}
                                <div className="mt-4 text-center">
                                    <span className="font-vietnam text-lg font-black text-slate-800 uppercase tracking-tight truncate block px-2">
                                        {currentMember.fullName}
                                    </span>
                                </div>
                            </div>

                            {/* Tape effect */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-yellow-200/20 backdrop-blur-[2px] border border-yellow-300/10 rotate-2 z-20 pointer-events-none" />
                        </div>

                        <div className="flex flex-col gap-5 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-950/50 flex items-center justify-center border border-cyan-500/20">
                                    <Users className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block font-inter">{t('member.gender')}</label>
                                    <p className="text-sm font-bold text-white uppercase font-vietnam">{currentMember.gender === 'male' ? t('member.gender.male') : t('member.gender.female')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-950/50 flex items-center justify-center border border-cyan-500/20">
                                    <Target className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block font-inter">{t('member.job')}</label>
                                    <p className="text-sm font-bold text-white uppercase font-vietnam">{currentMember.job || '---'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-950/50 flex items-center justify-center border border-cyan-500/20">
                                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block font-inter">{t('member.is_alive')}</label>
                                    <p className={cn(
                                        "text-sm font-bold uppercase font-vietnam",
                                        currentMember.isAlive ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                        {currentMember.isAlive ? t('member.alive') : t('member.deceased')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Detailed Bio & Content */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col min-h-[400px] md:min-h-0 relative">
                        {/* Background watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                            <img src="/logo.png" alt="" className="w-96 h-96 object-contain grayscale" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <header className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] md:text-xs font-bold text-cyan-500 uppercase tracking-[0.3em] font-inter">
                                        {language === 'vi' ? 'THÔNG TIN THÀNH VIÊN' : 'MEMBER PROFILE'}
                                    </span>
                                    <button onClick={closePresentation} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <h1 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-4 font-vietnam">
                                    {currentMember.fullName}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 rounded uppercase font-inter">
                                        {currentMember.alias || (language === 'vi' ? 'KHÔNG CÓ TÊN HIỆU' : 'NO ALIAS')}
                                    </div>
                                    <div className="h-px flex-1 bg-slate-700/50" />
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 font-vietnam">
                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-inter">
                                        <div className="w-1 h-3 bg-cyan-500" />
                                        {language === 'vi' ? 'Tiểu sử & Cuộc đời' : 'Biography & Life'}
                                    </h3>
                                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed italic opacity-90 font-medium">
                                        {currentMember.description || (language === 'vi' ? 'Lời kể về thành viên này đang được các con cháu trong dòng họ cập nhật. Những ký ức đẹp đẽ nhất sẽ sớm được ghi lại tại đây...' : 'The story of this member is being updated by the family descendants. The most beautiful memories will soon be recorded here...')}
                                    </p>
                                </div>

                                {/* Symbolic quote or stamp */}
                                <div className="mt-12 flex justify-end">
                                    <div className="text-right">
                                        <p className="text-cyan-500/30 italic text-sm font-medium">"Uống nước nhớ nguồn, làm con phải hiếu"</p>
                                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1 font-inter">- Anh Em Tui -</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            <footer className="mt-auto pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6 font-vietnam">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={handlePrev}
                                        className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 hover:border-cyan-500/50 shadow-lg active:scale-95 group"
                                    >
                                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">{language === 'vi' ? 'Thành viên' : 'Member'}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-white font-inter">{currentIndex + 1}</span>
                                            <span className="text-slate-600">/</span>
                                            <span className="text-xl font-bold text-slate-400 font-inter">{members.length}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 hover:border-cyan-500/50 shadow-lg active:scale-95 group"
                                    >
                                        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>

                                <button
                                    onClick={closePresentation}
                                    className="w-full sm:w-auto px-10 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl border border-slate-700 transition-all shadow-xl active:scale-95 font-inter"
                                >
                                    {language === 'vi' ? 'Đóng Trình Chiếu' : 'Close Presentation'}
                                </button>
                            </footer>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
