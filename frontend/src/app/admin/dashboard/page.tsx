"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TreeDeciduous, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/stores/languageStore';

export default function AdminDashboardPage() {
    const { t } = useLanguageStore();
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [statsRes, activityRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/admin/stats`, { headers }),
                    fetch(`${API_BASE_URL}/admin/activity`, { headers })
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (activityRes.ok) setActivity(await activityRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <div className="animate-pulse space-y-8">
        <div className="h-10 w-48 bg-slate-900 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-900 rounded-2xl" />)}
        </div>
    </div>;

    const cards = [
        { label: t('admin.dashboard.stats.users'), value: stats?.userCount || 0, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { label: t('admin.dashboard.stats.trees'), value: stats?.treeCount || 0, icon: TreeDeciduous, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: t('admin.dashboard.stats.active'), value: stats?.activeTrees || 0, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{t('admin.dashboard.title')}</h1>
                <p className="text-slate-500 text-sm uppercase font-black tracking-widest">{t('admin.dashboard.tagline')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group"
                    >
                        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 transition-all group-hover:opacity-40", card.bg)} />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-current shadow-2xl", card.color, card.bg)}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase">
                                <ArrowUpRight className="w-3 h-3" />
                                +0%
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{card.label}</p>
                            <h3 className="text-3xl font-black text-white">{card.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity / System Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest">{t('admin.dashboard.recent')}</h2>
                        <button className="text-[10px] text-cyan-500 uppercase font-black hover:underline">{t('admin.dashboard.view_all')}</button>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
                        {activity.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 text-xs uppercase font-black tracking-widest">
                                No recent activity detected
                            </div>
                        ) : activity.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors">
                                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-cyan-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white uppercase font-bold">New tree deployment: "{item.name}"</p>
                                        <p className="text-[10px] text-slate-500 font-mono">ID: {item.id} • {new Date(item.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black rounded border border-slate-700 uppercase">System</span>
                                    <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">{t('admin.dashboard.health')}</h2>
                    <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-black">
                                <span className="text-slate-500">{t('admin.dashboard.storage')}</span>
                                <span className="text-white">64%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[64%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-black">
                                <span className="text-slate-500">{t('admin.dashboard.api')}</span>
                                <span className="text-emerald-500">Stable</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[28%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-black">
                                <span className="text-slate-500">{t('admin.dashboard.clearance')}</span>
                                <span className="text-white">Active</span>
                            </div>
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] uppercase font-bold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                {t('admin.dashboard.encrypted')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
