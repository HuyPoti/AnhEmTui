'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, UserPlus, Loader2, Share2, Copy, Check, Users, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL } from '@/config/api';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    treeId: string | null;
}

export function ShareModal({ isOpen, onClose, treeId }: ShareModalProps) {
    const { token } = useAuthStore();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit'>('view');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!treeId) {
            alert('Vui lòng lưu cây lên mây trước khi chia sẻ.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/trees/${treeId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, permission })
            });

            if (!response.ok) throw new Error('Failed to share');

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (error: any) {
            alert('Lỗi chia sẻ: ' + error.message);
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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                    <h3 className="text-cyan-400 font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share Access
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h4 className="text-white font-bold">Access Granted!</h4>
                            <p className="text-slate-400 text-sm">Lời mời đã được gửi tới {email}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleShare} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-mono uppercase font-bold">Recipient Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-10 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                                        placeholder="partner@example.com"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800">
                                <p className="text-[9px] text-slate-600 pl-0 leading-tight">
                                    * Người nhận sẽ nhận được email chứa mật khẩu truy cập một lần.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 rounded mt-4 flex items-center justify-center gap-2 uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(8,145,178,0.3)]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Grant Access"}
                            </button>

                            <p className="text-[10px] text-slate-500 text-center uppercase tracking-tighter leading-tight mt-4">
                                * Một mật khẩu ngẫu nhiên sẽ được hệ thống tạo và gửi kèm email lời mời cho người nhận.
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
