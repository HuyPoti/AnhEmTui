"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';
import { useToastStore } from '@/stores/toastStore';

export default function AdminLoginPage() {
    const { t } = useLanguageStore();
    const router = useRouter();
    const toast = useToastStore();
    const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.message === 'OTP_SENT') {
                toast.success(t('admin.login.otp_sent'));
                setStep('OTP');
            } else {
                setError(data.message || t('auth.login.failed'));
                toast.error(data.message || t('auth.login.failed'));
            }
        } catch (err) {
            setError(t('tree.sync_failed'));
            toast.error(t('tree.sync_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Admin Authenticated');
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.user));
                router.push('/admin/dashboard');
            } else {
                setError(data.message || t('admin.login.otp_incorrect'));
                toast.error(data.message || t('admin.login.otp_incorrect'));
            }
        } catch (err) {
            setError(t('tree.sync_failed'));
            toast.error(t('tree.sync_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4 font-special-elite text-slate-300">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl mb-6 relative">
                        <Shield className="w-10 h-10 text-cyan-500" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">
                        {t('admin.login.title')}
                    </h1>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-mono">
                        {t('admin.login.tagline')}
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
                    <AnimatePresence mode="wait">
                        {step === 'LOGIN' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleLogin}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-1">{t('admin.login.identity')}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="EMAIL ADDRESS"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black ml-1">{t('admin.login.protocol')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="PASSWORD"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] uppercase font-bold"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    disabled={isLoading}
                                    className="w-full bg-white hover:bg-cyan-500 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('admin.login.begin')}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-8">
                                    <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <Key className="w-6 h-6 text-cyan-500" />
                                    </div>
                                    <h2 className="text-white text-lg font-bold uppercase tracking-widest">{t('admin.login.verify')}</h2>
                                    <p className="text-slate-500 text-[10px] uppercase font-mono">{t('admin.login.otp_sent')}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-5 text-center text-3xl font-black text-white tracking-[0.5em] focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] uppercase font-bold"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    disabled={isLoading}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        t('admin.login.authenticate')
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('LOGIN')}
                                    className="w-full text-slate-500 text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors"
                                >
                                    {t('admin.login.back')}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
