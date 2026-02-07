'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, Search, ArrowRight } from 'lucide-react';
import { useTreeStore } from '@/stores/treeStore';
import { useLanguageStore } from '@/stores/languageStore';

interface PublicAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PublicAccessModal({ isOpen, onClose, onSuccess }: PublicAccessModalProps) {
    const { accessPublicTree } = useTreeStore();
    const { language } = useLanguageStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await accessPublicTree(email, password);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Truy cập thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Search className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-wider font-mono">
                                {language === 'vi' ? 'Truy cập Gia phả' : 'Access Tree'}
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Guest Verification</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-xs font-mono uppercase text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-widest">Guest Identity (Email)</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="guest@example.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-12 py-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-widest">Access Key (Password)</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-12 py-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>{language === 'vi' ? 'Xác thực & Truy cập' : 'Verify & Access'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-slate-600 text-center uppercase tracking-tighter leading-tight italic">
                        * Nhập thông tin email và mật khẩu được gửi đến bạn qua lời mời từ chủ sở hữu.
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
