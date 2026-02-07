"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, EyeOff, TreeDeciduous, User, Mail, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';

export default function ArchivedCasesPage() {
    const { t } = useLanguageStore();
    const [trees, setTrees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTrees();
    }, []);

    const fetchTrees = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/admin/trees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTrees(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/admin/trees/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                setTrees(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredTrees = trees.filter(tree =>
        tree.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tree.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{t('admin.trees.title')}</h1>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Case Moderation • Tree Management</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:border-cyan-500/50 outline-none transition-all font-mono"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTrees.map((tree) => (
                    <motion.div
                        key={tree.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative group overflow-hidden"
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 transition-all",
                            tree.isActive ? "bg-emerald-500/20" : "bg-red-500/20"
                        )} />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:border-cyan-500/30 transition-colors">
                                <TreeDeciduous className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => toggleStatus(tree.id, tree.isActive)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all",
                                    tree.isActive
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                                )}
                            >
                                {tree.isActive ? (
                                    <><Eye className="w-3 h-3" /> {t('admin.trees.active')}</>
                                ) : (
                                    <><EyeOff className="w-3 h-3" /> {t('admin.trees.inactive')}</>
                                )}
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight line-clamp-1">{tree.name}</h3>
                                <p className="text-[10px] text-slate-500 font-mono">CASE_ID: {tree.id.slice(0, 13)}...</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                                <div className="space-y-1">
                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Custodian</p>
                                    <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase">
                                        <User className="w-3 h-3 text-cyan-500" />
                                        {tree.owner.fullName}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Node Count</p>
                                    <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase">
                                        <Clock className="w-3 h-3 text-cyan-500" />
                                        {tree._count?.members || 0} Entities
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">Timestamp</p>
                                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 flex items-center justify-between group-hover:border-slate-700 transition-colors">
                                    <span className="text-[10px] font-mono text-slate-400">
                                        {new Date(tree.createdAt).toLocaleString()}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredTrees.length === 0 && (
                    <div className="col-span-full p-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                        <AlertCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest">No matching cases identified</p>
                    </div>
                )}
            </div>
        </div>
    );
}
