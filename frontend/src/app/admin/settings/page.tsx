"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, Shield, Key, AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';

export default function TerminalProtocolPage() {
    const { t } = useLanguageStore();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Cập nhật mã truy cập thành công' });
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Cập nhật thất bại' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi kết nối máy chủ' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-12">
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{t('admin.settings.title')}</h1>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">HQ Security Protocol • System Configuration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px]" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-500 group-hover:border-cyan-500/30 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-white uppercase tracking-widest">{t('admin.settings.change_password')}</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-1">{t('admin.settings.old_password')}</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-1">{t('admin.settings.new_password')}</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-1">Confirm New Code</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "p-4 rounded-xl flex items-center gap-3 text-[10px] uppercase font-bold border",
                                        message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                    )}
                                >
                                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {message.text}
                                </motion.div>
                            )}

                            <button
                                disabled={isLoading}
                                className="w-full py-4 bg-white hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> {t('admin.settings.update')}</>}
                            </button>
                        </form>
                    </section>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3 text-cyan-500 mb-2">
                            <Shield className="w-6 h-6" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Security Status</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                { label: 'Two-Factor Auth', status: 'Enabled', color: 'text-emerald-500' },
                                { label: 'SSL Encryption', status: 'Active', color: 'text-emerald-500' },
                                { label: 'Login Alerts', status: 'Configured', color: 'text-emerald-500' },
                                { label: 'IP White-listing', status: 'Manual', color: 'text-slate-500' },
                            ].map((item) => (
                                <li key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</span>
                                    <span className={cn("text-[10px] font-black uppercase", item.color)}>{item.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
