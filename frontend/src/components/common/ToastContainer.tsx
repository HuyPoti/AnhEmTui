"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore, ToastType } from '@/stores/toastStore';

const toastIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-cyan-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const toastStyles: Record<ToastType, string> = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-red-500/20 bg-red-500/5",
    info: "border-cyan-500/20 bg-cyan-500/5",
    warning: "border-amber-500/20 bg-amber-500/5",
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none items-center">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-md",
                            toastStyles[toast.type]
                        )}
                    >
                        <div className="shrink-0">{toastIcons[toast.type]}</div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest text-white leading-tight">
                                {toast.type}
                            </p>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 p-1 rounded-lg hover:bg-slate-800 transition-colors text-slate-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
