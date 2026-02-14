"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Shield, User, Mail, Calendar, ExternalLink, Lock, Unlock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';
import { useToastStore } from '@/stores/toastStore';

export default function UserRegistryPage() {
    const { t } = useLanguageStore();
    const toast = useToastStore();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        setIsSubmitting(userId);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                toast.success(currentStatus ? 'Account Locked' : 'Account Unlocked');
                await fetchUsers();
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{t('admin.users.title')}</h1>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Authorized Access Only • User Management</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('admin.users.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:border-cyan-500/50 outline-none transition-all font-mono"
                    />
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.users.table.name')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.users.table.email')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.users.table.role')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.users.table.joined')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.users.table.status')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-800 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:border-cyan-500/30 transition-colors">
                                                {user.fullName[0]}
                                            </div>
                                            <span className="text-xs font-bold text-white uppercase">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
                                            user.role === 'ADMIN'
                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                : "bg-slate-800 text-slate-500 border-slate-700"
                                        )}>
                                            {user.role === 'ADMIN' && <Shield className="w-2.5 h-2.5" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
                                                user.isActive !== false
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {user.isActive !== false ? 'Active' : 'Locked'}
                                            </span>
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
                                                user.isPremium
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    : "bg-slate-800 text-slate-500 border-slate-700"
                                            )}>
                                                {user.isPremium ? 'Premium' : 'Free'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                                                    disabled={isSubmitting === user.id}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all border",
                                                        user.isActive !== false
                                                            ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
                                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                                    )}
                                                    title={user.isActive !== false ? 'Lock Account' : 'Unlock Account'}
                                                >
                                                    {isSubmitting === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.isActive !== false ? (
                                                        <Lock className="w-4 h-4" />
                                                    ) : (
                                                        <Unlock className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            <button className="text-slate-600 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center">
                        <User className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest">No matching identities found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
