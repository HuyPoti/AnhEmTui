"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, Calendar, LayoutGrid, AlertCircle, Loader2, X, Upload, Ghost, Star, Info, Share2, Edit2, Network, List, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';
import { useToastStore } from '@/stores/toastStore';
import RelationshipTree from '@/components/admin/collections/RelationshipTree';

export default function CollectionManagementPage() {
    const { t } = useLanguageStore();
    const toast = useToastStore();
    const [collections, setCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<any>(null);
    const [editingCollection, setEditingCollection] = useState<any>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
    const [newRelation, setNewRelation] = useState({ sourceCardId: '', targetCardId: '', relationType: 'rival' });
    const [relationViewMode, setRelationViewMode] = useState<'list' | 'tree'>('list');
    const [editingCard, setEditingCard] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Form states
    const [newCollection, setNewCollection] = useState({ name: '', description: '', type: 'anime' });
    const [updateCollectionData, setUpdateCollectionData] = useState({ name: '', description: '', type: 'anime' });
    const [newCard, setNewCard] = useState({ name: '', characterName: '', photoUrl: '', rarity: 'common' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCollections(data);
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

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCollection)
            });
            if (res.ok) {
                toast.success('Collection Created');
                await fetchCollections();
                setIsCreateModalOpen(false);
                setNewCollection({ name: '', description: '', type: 'anime' });
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCollection) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/${editingCollection.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateCollectionData)
            });
            if (res.ok) {
                toast.success('Collection Updated');
                await fetchCollections();
                setIsEditModalOpen(false);
                setEditingCollection(null);
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCollection) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}/cards`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCard)
            });
            if (res.ok) {
                toast.success('Card Added');
                const updatedCollection = await (await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}`)).json();
                setCollections(prev => prev.map(c => c.id === selectedCollection.id ? updatedCollection : c));
                setSelectedCollection(updatedCollection);
                setNewCard({ name: '', characterName: '', photoUrl: '', rarity: 'common' });
            } else {
                toast.error(t('common.error'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCard || !selectedCollection) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/cards/${editingCard.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCard)
            });
            if (res.ok) {
                toast.success('Card Updated');
                const updatedCollection = await (await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}`)).json();
                setCollections(prev => prev.map(c => c.id === selectedCollection.id ? updatedCollection : c));
                setSelectedCollection(updatedCollection);
                setEditingCard(null);
                setNewCard({ name: '', characterName: '', photoUrl: '', rarity: 'common' });
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                const base64 = reader.result as string;
                const res = await fetch(`${API_BASE_URL}/images/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image: base64, folder: 'collections' })
                });

                if (res.ok) {
                    const data = await res.json();
                    setNewCard(prev => ({ ...prev, photoUrl: data.url }));
                    toast.success('Image Uploaded');
                } else {
                    toast.error('Upload Failed');
                }
            } catch (err) {
                console.error('Upload failed:', err);
                toast.error('Upload Failed');
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('common.delete_confirm') || 'Are you sure?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Collection Deleted');
                setCollections(collections.filter(c => c.id !== id));
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!confirm(t('common.delete_confirm') || 'Are you sure?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/cards/${cardId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Card Deleted');
                const updatedCollection = await (await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}`)).json();
                setCollections(prev => prev.map(c => c.id === selectedCollection.id ? updatedCollection : c));
                setSelectedCollection(updatedCollection);
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        }
    };

    const handleAddRelation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCollection) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}/relations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRelation)
            });
            if (res.ok) {
                toast.success('Connection Established');
                const updatedCollection = await (await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}`)).json();
                setCollections(prev => prev.map(c => c.id === selectedCollection.id ? updatedCollection : c));
                setSelectedCollection(updatedCollection);
                setNewRelation({ sourceCardId: '', targetCardId: '', relationType: 'rival' });
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRelation = async (relationId: string) => {
        if (!confirm(t('common.delete_confirm') || 'Are you sure?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/relations/${relationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Connection Deleted');
                const updatedCollection = await (await fetch(`${API_BASE_URL}/collections/${selectedCollection.id}`)).json();
                setCollections(prev => prev.map(c => c.id === selectedCollection.id ? updatedCollection : c));
                setSelectedCollection(updatedCollection);
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            toast.error(t('common.error'));
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/collections/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Collection ${status}`);
                fetchCollections();
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Archive Archives</h1>
                    <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest italic">Protocol 04 // Asset Management</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-white hover:bg-cyan-500 text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex items-center gap-2 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    {t('admin.collections.create')}
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 border-b border-slate-800 pb-px">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative",
                            statusFilter === status ? "text-cyan-500" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {status}
                        {statusFilter === status && (
                            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                        )}
                    </button>
                ) as any)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-3xl animate-pulse" />)
                ) : collections.filter(c => statusFilter === 'ALL' || c.status === statusFilter).map((collection) => (
                    <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-cyan-500 group-hover:border-cyan-500/30 transition-all">
                                <Package className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                {collection.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(collection.id, 'APPROVED')}
                                            className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-500"
                                            title="Approve"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(collection.id, 'REJECTED')}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                                            title="Reject"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        setEditingCollection(collection);
                                        setUpdateCollectionData({
                                            name: collection.name,
                                            description: collection.description || '',
                                            type: collection.type
                                        });
                                        setIsEditModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors text-slate-600 hover:text-cyan-500"
                                    title={t('common.edit')}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setSelectedCollection(collection); setIsCardModalOpen(true); }}
                                    className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors text-slate-600 hover:text-cyan-500"
                                >
                                    <Ghost className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(collection.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-600 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setSelectedCollection(collection); setIsRelationModalOpen(true); }}
                                    className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors text-slate-600 hover:text-amber-500"
                                    title="Design Relationship Tree"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                        collection.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            collection.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>{collection.status}</span>
                                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 rounded text-[8px] font-black uppercase border border-cyan-500/20">{collection.type}</span>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{collection.name}</h3>
                                </div>
                                <p className="text-xs text-slate-500 font-mono italic line-clamp-2">"{collection.description || 'No database intel...'}"</p>
                                {collection.author && (
                                    <p className="text-[8px] text-slate-600 uppercase font-black mt-2">Submitted by: {collection.author.fullName || collection.author.email}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <LayoutGrid className="w-3 h-3" />
                                    {collection.cards?.length || 0} {t('admin.collections.assets')}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(collection.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                onClick={() => { setSelectedCollection(collection); setIsCardModalOpen(true); }}
                                className="w-full py-3 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                            >
                                {t('admin.collections.manage_cards')}
                            </button>
                        </div>
                    </motion.div>
                ))}

                {!isLoading && collections.length === 0 && (
                    <div className="col-span-full p-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                        <AlertCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest">{t('admin.collections.no_assets')}</p>
                    </div>
                )}
            </div>

            {/* Create Collection Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0c0c0c] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />

                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('admin.collections.create')}</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors text-slate-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCollection} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.archive_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCollection.name}
                                        onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
                                        placeholder="e.g. Anime Legends 2024"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.intel_desc')}</label>
                                    <textarea
                                        value={newCollection.description}
                                        onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                                        placeholder="Detailed brief of the archive contents..."
                                        rows={3}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.category')}</label>
                                    <select
                                        value={newCollection.type}
                                        onChange={e => setNewCollection({ ...newCollection, type: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none uppercase font-black tracking-widest"
                                    >
                                        <option value="anime" className="bg-slate-950">Anime</option>
                                        <option value="movie" className="bg-slate-950">Movies</option>
                                        <option value="historical" className="bg-slate-950">Historical</option>
                                        <option value="special" className="bg-slate-950">Special Ops</option>
                                    </select>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-white hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('admin.collections.commit')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Collection Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingCollection && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0c0c0c] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />

                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('common.edit')}</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors text-slate-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateCollection} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.archive_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={updateCollectionData.name}
                                        onChange={e => setUpdateCollectionData({ ...updateCollectionData, name: e.target.value })}
                                        placeholder="e.g. Anime Legends 2024"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.intel_desc')}</label>
                                    <textarea
                                        value={updateCollectionData.description}
                                        onChange={e => setUpdateCollectionData({ ...updateCollectionData, description: e.target.value })}
                                        placeholder="Detailed brief of the archive contents..."
                                        rows={3}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.category')}</label>
                                    <select
                                        value={updateCollectionData.type}
                                        onChange={e => setUpdateCollectionData({ ...updateCollectionData, type: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none uppercase font-black tracking-widest"
                                    >
                                        <option value="anime" className="bg-slate-950">Anime</option>
                                        <option value="movie" className="bg-slate-950">Movies</option>
                                        <option value="historical" className="bg-slate-950">Historical</option>
                                        <option value="special" className="bg-slate-950">Special Ops</option>
                                    </select>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-white hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.save')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Card Management Modal */}
            <AnimatePresence>
                {isCardModalOpen && selectedCollection && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCardModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0c] border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,255,255,0.05)]"
                        >
                            {/* Left Panel: Form */}
                            <div className="w-full md:w-[400px] p-10 border-r border-slate-800 bg-slate-950/30 overflow-y-auto">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{editingCard ? 'Edit Card' : t('admin.collections.issue_card')}</h2>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">{selectedCollection.name}</p>
                                    </div>
                                </div>

                                <form onSubmit={editingCard ? handleUpdateCard : handleAddCard} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.card_name')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCard.name}
                                            onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                            placeholder="e.g. Ultra Rare Gojo"
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-cyan-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.char_name')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCard.characterName}
                                            onChange={e => setNewCard({ ...newCard, characterName: e.target.value })}
                                            placeholder="Subject Full Name..."
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-cyan-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.visual_url')}</label>
                                        <div className="relative group">
                                            <input
                                                type="url"
                                                required
                                                value={newCard.photoUrl}
                                                onChange={e => setNewCard({ ...newCard, photoUrl: e.target.value })}
                                                placeholder="https://image-hq.com/subject-01.png"
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-cyan-500/50 outline-none transition-all pr-24"
                                            />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <button
                                                type="button"
                                                disabled={isUploading}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[8px] font-black uppercase rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                {isUploading ? '...' : (editingCard ? 'Change' : 'Upload')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('admin.collections.rarity')}</label>
                                        <select
                                            value={newCard.rarity}
                                            onChange={e => setNewCard({ ...newCard, rarity: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-cyan-500/50 outline-none transition-all appearance-none uppercase font-black tracking-widest"
                                        >
                                            <option value="common">Common</option>
                                            <option value="rare">Rare</option>
                                            <option value="epic">Epic</option>
                                            <option value="legendary">Legendary</option>
                                        </select>
                                    </div>

                                    <button
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_30px_rgba(8,145,178,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCard ? 'Save Changes' : 'Issue Card')}
                                    </button>
                                    {editingCard && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCard(null);
                                                setNewCard({ name: '', characterName: '', photoUrl: '', rarity: 'common' });
                                            }}
                                            className="w-full py-2 text-[10px] text-slate-500 uppercase font-black hover:text-white transition-colors"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* Right Panel: Cards Grid */}
                            <div className="flex-1 p-10 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-8 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <Info className="w-4 h-4 text-slate-600" />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Archive contains {selectedCollection.cards?.length || 0} identifying assets</p>
                                    </div>
                                    <button onClick={() => setIsCardModalOpen(false)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors text-slate-500">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-6 pr-2 custom-scrollbar">
                                    {selectedCollection.cards?.map((card: any) => (
                                        <motion.div
                                            key={card.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group aspect-[3/4] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative"
                                        >
                                            <img src={card.photoUrl} alt={card.name} className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                            <div className="absolute inset-x-0 bottom-0 p-4 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[7px] font-black uppercase border",
                                                        card.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                                                            card.rarity === 'epic' ? "bg-purple-500/20 text-purple-500 border-purple-500/30" :
                                                                card.rarity === 'rare' ? "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" :
                                                                    "bg-slate-500/20 text-slate-400 border-slate-500/30"
                                                    )}>
                                                        {card.rarity}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCard(card);
                                                                setNewCard({
                                                                    name: card.name,
                                                                    characterName: card.characterName,
                                                                    photoUrl: card.photoUrl,
                                                                    rarity: card.rarity
                                                                });
                                                            }}
                                                            className="p-1.5 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCard(card.id)}
                                                            className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-white font-black uppercase tracking-tight line-clamp-1">{card.name}</p>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{card.characterName}</p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {(!selectedCollection.cards || selectedCollection.cards.length === 0) && (
                                        <div className="col-span-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl opacity-30 p-10">
                                            <LayoutGrid className="w-12 h-12 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-widest text-center">No visual profiles issued for this collection</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Relation Management Modal */}
            <AnimatePresence>
                {isRelationModalOpen && selectedCollection && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRelationModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={cn(
                                "relative w-full h-[85vh] bg-[#0c0c0c] border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(245,158,11,0.05)] transition-all duration-500",
                                relationViewMode === 'tree' ? "max-w-[95vw]" : "max-w-5xl"
                            )}
                        >
                            {/* Left Panel: Create Relation */}
                            {relationViewMode === 'list' && (
                                <div className="w-full md:w-[400px] p-10 border-r border-slate-800 bg-slate-950/30 overflow-y-auto shrink-0">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                            <Share2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Design Tree</h2>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">{selectedCollection.name}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleAddRelation} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Source Character</label>
                                            <select
                                                required
                                                value={newRelation.sourceCardId}
                                                onChange={e => setNewRelation({ ...newRelation, sourceCardId: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-amber-500/50 outline-none transition-all appearance-none uppercase font-black tracking-widest"
                                            >
                                                <option value="">Select Character...</option>
                                                {selectedCollection.cards?.map((card: any) => (
                                                    <option key={card.id} value={card.id}>{card.characterName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2 text-center py-2">
                                            <div className="w-px h-8 bg-slate-800 mx-auto" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Relationship Type</label>
                                            <select
                                                required
                                                value={newRelation.relationType}
                                                onChange={e => setNewRelation({ ...newRelation, relationType: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-amber-500/50 outline-none transition-all appearance-none uppercase font-black tracking-widest"
                                            >
                                                <option value="rival">Rival / Đối thủ</option>
                                                <option value="mentor">Mentor / Sư phụ</option>
                                                <option value="student">Student / Đệ tử</option>
                                                <option value="ally">Ally / Đồng minh</option>
                                                <option value="enemy">Enemy / Kẻ thù</option>
                                                <option value="lover">Lover / Người yêu</option>
                                                <option value="teammate">Teammate / Đồng đội</option>
                                                <option value="parent">Parent / Cha mẹ</option>
                                                <option value="child">Child / Con cái</option>
                                                <option value="other">Other / Khác</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2 text-center py-2">
                                            <div className="w-px h-8 bg-slate-800 mx-auto" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Target Character</label>
                                            <select
                                                required
                                                value={newRelation.targetCardId}
                                                onChange={e => setNewRelation({ ...newRelation, targetCardId: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white text-xs focus:border-amber-500/50 outline-none transition-all appearance-none uppercase font-black tracking-widest"
                                            >
                                                <option value="">Select Character...</option>
                                                {selectedCollection.cards?.map((card: any) => (
                                                    <option key={card.id} value={card.id}>{card.characterName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            disabled={isSubmitting || !newRelation.sourceCardId || !newRelation.targetCardId || newRelation.sourceCardId === newRelation.targetCardId}
                                            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Establish Connection'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Right Panel: Active Connections */}
                            <div className="flex-1 p-10 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-8 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <Info className="w-4 h-4 text-slate-600" />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Archive contains {selectedCollection.relations?.length || 0} established connections</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mr-4">
                                            <button
                                                onClick={() => setRelationViewMode('list')}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                                    relationViewMode === 'list' ? "bg-amber-500 text-black shadow-lg" : "text-slate-500 hover:text-white"
                                                )}
                                            >
                                                <List className="w-3 h-3" />
                                                List
                                            </button>
                                            <button
                                                onClick={() => setRelationViewMode('tree')}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                                    relationViewMode === 'tree' ? "bg-amber-500 text-black shadow-lg" : "text-slate-500 hover:text-white"
                                                )}
                                            >
                                                <Network className="w-3 h-3" />
                                                Visual Tree
                                            </button>
                                        </div>
                                        <button onClick={() => setIsRelationModalOpen(false)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors text-slate-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {relationViewMode === 'tree' ? (
                                    <div className="flex-1 min-h-0 py-4">
                                        <RelationshipTree
                                            cards={selectedCollection.cards || []}
                                            relations={selectedCollection.relations || []}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                        {selectedCollection.relations?.map((rel: any) => {
                                            const source = selectedCollection.cards.find((c: any) => c.id === rel.sourceCardId);
                                            const target = selectedCollection.cards.find((c: any) => c.id === rel.targetCardId);
                                            return (
                                                <div key={rel.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-white font-black uppercase tracking-tighter">{source?.characterName || 'Unknown'}</p>
                                                            <p className="text-[8px] text-slate-500 uppercase tracking-widest">{source?.name || '---'}</p>
                                                        </div>

                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase rounded-full">
                                                                {rel.relationType}
                                                            </div>
                                                            <div className="w-20 h-px bg-slate-800 relative">
                                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-amber-500 rounded-full" />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] text-white font-black uppercase tracking-tighter">{target?.characterName || 'Unknown'}</p>
                                                            <p className="text-[8px] text-slate-500 uppercase tracking-widest">{target?.name || '---'}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteRelation(rel.id)}
                                                        className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {(!selectedCollection.relations || selectedCollection.relations.length === 0) && (
                                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl opacity-30 p-10">
                                                <Share2 className="w-12 h-12 mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest text-center">No character connections established yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }
            `}</style>
        </div>
    );
}
