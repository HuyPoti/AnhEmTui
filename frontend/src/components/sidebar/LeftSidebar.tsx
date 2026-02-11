'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    Settings,
    ChevronLeft,
    ChevronRight,
    TreePine,
    Search,
    Clock,
    User,
    LogOut,
    Trash2,
    Edit2,
    Save,
    RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTreeStore } from '@/stores/treeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';

export function LeftSidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { user, isAuthenticated, token, logout } = useAuthStore();
    const { userTrees, setUserTrees, treeId, loadTree, createNewTree, deleteTree, syncTree, isReadOnly } = useTreeStore();
    const { t, language } = useLanguageStore();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'trees' | 'history'>('trees');
    const [history, setHistory] = useState<any[]>([]);

    const [editingTreeId, setEditingTreeId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchTrees();
        } else {
            setUserTrees([]);
        }
    }, [isAuthenticated, token]);

    const fetchTrees = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/trees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                logout();
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setUserTrees(data);
            }
        } catch (error) {
            console.error('Failed to fetch trees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (!treeId || !token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/trees/${treeId}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                logout();
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTree = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const msg = language === 'vi'
            ? 'Bạn có chắc chắn muốn xóa bản ghi này? Toàn bộ dữ liệu sẽ bị hủy.'
            : 'Are you sure you want to delete this tree terminal? All data will be wiped.';
        if (confirm(msg)) {
            try {
                await deleteTree(token!, id);
                alert(language === 'vi' ? 'Tiến trình đã bị chấm dứt.' : 'Terminal sequence terminated.');
            } catch (error: any) {
                if (error.message === 'UNAUTHORIZED') {
                    logout();
                    return;
                }
                alert((language === 'vi' ? 'Lỗi: ' : 'Error: ') + error.message);
            }
        }
    };

    const handleRenameTree = async (id: string) => {
        if (!newName.trim()) return;
        try {
            const treeToRename = userTrees.find(t => t.id === id);
            if (treeToRename) {
                await syncTree(token!, id, newName);
                setEditingTreeId(null);
                fetchTrees();
            }
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED') {
                logout();
                return;
            }
            alert((language === 'vi' ? 'Lỗi đổi tên: ' : 'Rename failed: ') + error.message);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, treeId]);

    return (
        <motion.div
            initial={false}
            animate={{
                width: isExpanded ? 280 : 64,
                x: 0
            }}
            className={cn(
                "h-screen bg-slate-900 border-r border-slate-800 flex flex-col relative z-[100] transition-all",
                "fixed lg:relative overflow-visible"
            )}
        >
            {/* Backdrop for mobile when expanded */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1] lg:hidden"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-20 lg:top-10 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-black hover:bg-cyan-500 transition-colors z-10 shadow-lg"
            >
                {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                <div className={cn("flex items-center gap-3 overflow-hidden whitespace-nowrap", !isExpanded && "justify-center")}>
                    <div className="w-8 h-8 bg-classified/20 rounded flex items-center justify-center text-classified shrink-0">
                        <Search className="w-5 h-5" />
                    </div>
                    {isExpanded && (
                        <span className="font-typewriter font-bold text-white tracking-widest uppercase text-sm">
                            {language === 'vi' ? 'HỒ SƠ GIA PHẢ' : 'CASE FILES'}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {isExpanded && (
                <div className="flex p-2 gap-1 bg-slate-950/50 m-2 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setActiveTab('trees')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-typewriter uppercase tracking-wider transition-all",
                            activeTab === 'trees' ? "bg-classified text-white font-bold" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {language === 'vi' ? 'Danh sách' : 'Archives'}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-typewriter uppercase tracking-wider transition-all",
                            activeTab === 'history' ? "bg-classified text-white font-bold" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <History className="w-3.5 h-3.5" />
                        {language === 'vi' ? 'Nhật ký' : 'Chronicle'}
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {!isAuthenticated ? (
                    <div className="text-center py-10 px-4">
                        <User className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        {isExpanded && (
                            <p className="text-[10px] text-slate-500 font-mono uppercase">
                                {language === 'vi' ? 'Vui lòng đăng nhập để truy cập dữ liệu.' : 'Please login to access cloud records.'}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activeTab === 'trees' ? (
                            <>
                                <div className="flex gap-1 mb-4">
                                    {!isReadOnly && (
                                        <button
                                            onClick={createNewTree}
                                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded hover:bg-slate-800 transition-colors text-cyan-400 border border-transparent hover:border-cyan-900/50 group"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">
                                                {language === 'vi' ? 'Tạo mới' : 'New'}
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        onClick={fetchTrees}
                                        disabled={loading}
                                        className={cn(
                                            "p-2 rounded hover:bg-slate-800 transition-colors text-slate-400 border border-transparent hover:border-slate-800 group",
                                            loading && "animate-spin text-cyan-500"
                                        )}
                                        title={language === 'vi' ? 'Làm mới' : 'Refresh'}
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>

                                {userTrees.map((tree) => (
                                    <div key={tree.id} className="group relative">
                                        <button
                                            onClick={() => loadTree(tree)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 rounded transition-all group overflow-hidden whitespace-nowrap",
                                                treeId === tree.id
                                                    ? "bg-cyan-900/30 border border-cyan-500/30 text-cyan-400"
                                                    : "text-slate-400 hover:bg-slate-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shrink-0",
                                                treeId === tree.id ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-slate-700"
                                            )} />
                                            {isExpanded && (
                                                <div className="flex-1 flex flex-col items-start min-w-0">
                                                    {editingTreeId === tree.id ? (
                                                        <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                                                            <input
                                                                value={newName}
                                                                onChange={e => setNewName(e.target.value)}
                                                                className="bg-slate-950 border border-classified/50 text-[10px] px-1 py-0.5 w-full text-white font-typewriter focus:outline-none"
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleRenameTree(tree.id)} className="text-classified p-0.5 hover:bg-classified/20 rounded">
                                                                <Save className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="text-[10px] font-bold font-typewriter uppercase truncate w-full">{tree.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </button>

                                        {isExpanded && !editingTreeId && !isReadOnly && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingTreeId(tree.id);
                                                        setNewName(tree.name);
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteTree(e, tree.id)}
                                                    className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="space-y-4 pt-2">
                                {history.map((log) => (
                                    <div key={log.id} className="p-2 border-l-2 border-slate-800 hover:border-cyan-500 transition-colors pl-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            <span className="text-[9px] text-slate-500 font-mono uppercase">
                                                {new Date(log.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-white font-mono leading-relaxed space-y-1">
                                            <p><span className="text-cyan-500 font-bold">{log.action}</span></p>
                                            {log.details && typeof log.details === 'object' && (
                                                <p className="text-[9px] text-slate-500 italic">
                                                    Nodes: {(log.details as any).nodeCount} | Name: {(log.details as any).name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && isExpanded && (
                                    <p className="text-[10px] text-slate-600 italic text-center py-4">
                                        {language === 'vi' ? 'Không có bản ghi nào.' : 'No logs found for this instance.'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                {isAuthenticated ? (
                    <div className={cn("flex items-center gap-3 overflow-hidden", !isExpanded && "justify-center")}>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                        </div>
                        {isExpanded && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-white uppercase truncate">{user?.fullName}</p>
                                <p className="text-[9px] text-slate-500 font-mono truncate">{user?.email}</p>
                            </div>
                        )}
                        {isExpanded && (
                            <button onClick={logout} className="p-1 hover:text-red-500 transition-colors shrink-0">
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={cn("flex justify-center", !isExpanded && "hidden")}>
                        <span className="text-[9px] text-slate-700 font-mono uppercase">
                            {language === 'vi' ? 'Đang chờ xác thực' : 'Awaiting Authorization'}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
