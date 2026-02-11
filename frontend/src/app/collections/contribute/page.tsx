"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Ghost, Share2, Plus, Loader2, Save, Camera, Upload, Trash2, Network, User, Star, LayoutGrid, Info, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { useLanguageStore } from '@/stores/languageStore';
import { useToastStore } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

export default function ContributeCollectionPage() {
    const router = useRouter();
    const { t } = useLanguageStore();
    const toast = useToastStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [collection, setCollection] = useState({ name: '', description: '', type: 'anime' });
    const [createdCollection, setCreatedCollection] = useState<any>(null);
    const [view, setView] = useState<'list' | 'create' | 'manage'>('list');
    const [myCollections, setMyCollections] = useState<any[]>([]);

    // Card Management State
    const [cards, setCards] = useState<any[]>([]);
    const [newCard, setNewCard] = useState({ name: '', characterName: '', photoUrl: '', rarity: 'common' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Relation Management State
    const [relations, setRelations] = useState<any[]>([]);
    const [newRelation, setNewRelation] = useState({ sourceCardId: '', targetCardId: '', relationType: 'ally' });

    useEffect(() => {
        fetchMyCollections();
    }, []);

    const fetchMyCollections = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/collections/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyCollections(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditCollection = (col: any) => {
        setCreatedCollection(col);
        setCollection({ name: col.name, description: col.description, type: col.type });
        setCards(col.cards || []);
        setRelations(col.relations || []);
        setView('manage');
    };

    const handleSubmitForReview = async (id: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collections/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'PENDING' })
            });

            if (res.ok) {
                toast.success('Archive submitted for Final Review!');
                fetchMyCollections();
                setView('list');
                setCreatedCollection(null);
            }
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to contribute');
                router.push('/');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/collections/contribute`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collection)
            });

            if (res.ok) {
                const data = await res.json();
                setCreatedCollection(data);
                setView('manage');
                toast.success('Collection Draft Created! You can now add cards.');
            } else {
                toast.error('Failed to create collection');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
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
        reader.onload = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/images/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image: reader.result,
                        folder: 'contributions'
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setNewCard({ ...newCard, photoUrl: data.url });
                    toast.success('Image Uploaded!');
                }
            } catch (error) {
                toast.error('Upload failed');
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createdCollection) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collections/${createdCollection.id}/cards`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCard)
            });

            if (res.ok) {
                const card = await res.json();
                setCards([...cards, card]);
                setNewCard({ name: '', characterName: '', photoUrl: '', rarity: 'common' });
                toast.success('Card added to your collection!');
            }
        } catch (err) {
            toast.error('Failed to add card');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddRelation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createdCollection) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collections/${createdCollection.id}/relations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRelation)
            });

            if (res.ok) {
                const relation = await res.json();
                setRelations([...relations, relation]);
                setNewRelation({ sourceCardId: '', targetCardId: '', relationType: 'ally' });
                toast.success('Relationship defined!');
            }
        } catch (err) {
            toast.error('Failed to add relation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-special-elite">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-500" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Contribute Intel</h1>
                            <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest italic">Secure Submission Protocol</p>
                        </div>
                    </div>
                    {createdCollection && (
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Draft Active</span>
                            </div>
                        </div>
                    )}
                </div>

                {view === 'list' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase italic tracking-widest flex items-center gap-3">
                                <LayoutGrid className="w-5 h-5 text-cyan-500" />
                                Your Submissions
                            </h2>
                            <button
                                onClick={() => setView('create')}
                                className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Archive
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCollections.map(col => (
                                <div key={col.id} className="group bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-cyan-500/30 transition-all space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            col.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                col.status === 'REJECTED' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                    col.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                        )}>
                                            {col.status}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase">{col.type}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tighter line-clamp-1">{col.name}</h3>
                                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{col.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        {(col.status === 'DRAFT' || col.status === 'REJECTED' || col.status === 'APPROVED') && (
                                            <button
                                                onClick={() => handleEditCollection(col)}
                                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                Edit Intel
                                            </button>
                                        )}
                                        {col.status === 'REJECTED' && (
                                            <button
                                                onClick={() => handleSubmitForReview(col.id)}
                                                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                Resubmit
                                            </button>
                                        )}
                                        {col.status === 'APPROVED' && (
                                            <button
                                                onClick={() => router.push(`/collections/${col.id}`)}
                                                className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                View Live
                                            </button>
                                        )}
                                        {col.status === 'PENDING' && (
                                            <div className="flex-1 py-2 text-center text-slate-500 text-[10px] font-black uppercase italic">
                                                Under Review
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {myCollections.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
                                    <Ghost className="w-16 h-16 mb-4" />
                                    <p className="text-xs uppercase tracking-widest font-black">Your archives are empty</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : view === 'create' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl"
                    >
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Archive Identity</label>
                                <input
                                    required
                                    value={collection.name}
                                    onChange={e => setCollection({ ...collection, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 outline-none transition-all"
                                    placeholder="e.g. Operation: Blue Lock Profiles"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Sector Type</label>
                                    <select
                                        value={collection.type}
                                        onChange={e => setCollection({ ...collection, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 outline-none transition-all appearance-none"
                                    >
                                        <option value="anime">Anime</option>
                                        <option value="movie">Movie</option>
                                        <option value="historical">Historical</option>
                                        <option value="other">Fragment</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Intel Briefing</label>
                                <textarea
                                    value={collection.description}
                                    onChange={e => setCollection({ ...collection, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500/50 outline-none transition-all h-32 resize-none"
                                    placeholder="Describe the significance of this intel..."
                                />
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-500 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Initialize Draft'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Collection Info Panel */}
                        <div className="lg:col-span-12">
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-black uppercase text-white tracking-widest italic">{createdCollection?.name}</h2>
                                    <p className="text-slate-500 text-xs mt-1 uppercase font-bold">{createdCollection?.type} Archives</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            fetchMyCollections();
                                            setView('list');
                                            setCreatedCollection(null);
                                        }}
                                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                        Finish Later
                                    </button>
                                    <button
                                        onClick={() => handleSubmitForReview(createdCollection.id)}
                                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                                    >
                                        {createdCollection?.status === 'APPROVED' ? 'Resubmit for Final Review' : 'Submit for Final Review'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cards Section */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase italic tracking-wider flex items-center gap-3">
                                    <LayoutGrid className="w-5 h-5 text-cyan-500" />
                                    Identifying Assets
                                </h3>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{cards.length} Assets Registered</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Add Card Form */}
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-cyan-500 tracking-widest border-b border-white/5 pb-2">Add New Subject</h4>
                                    <form onSubmit={handleAddCard} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-slate-500 uppercase font-black ml-1 ml-1">Character Name</label>
                                            <input
                                                required
                                                value={newCard.characterName}
                                                onChange={e => setNewCard({ ...newCard, characterName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs focus:border-cyan-500/50 outline-none"
                                                placeholder="e.g. Hyuga Neji"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-slate-500 uppercase font-black ml-1 ml-1">Photo URL / Upload</label>
                                            <div className="flex gap-2">
                                                <input
                                                    required
                                                    value={newCard.photoUrl}
                                                    onChange={e => setNewCard({ ...newCard, photoUrl: e.target.value })}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs focus:border-cyan-500/50 outline-none"
                                                    placeholder="URL..."
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
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                                >
                                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-500" /> : <Camera className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[8px] text-slate-500 uppercase font-black ml-1">Card Rank</label>
                                                <select
                                                    value={newCard.rarity}
                                                    onChange={e => setNewCard({ ...newCard, rarity: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[10px] font-black uppercase outline-none"
                                                >
                                                    <option value="common">Common</option>
                                                    <option value="rare">Rare</option>
                                                    <option value="epic">Epic</option>
                                                    <option value="legendary">Legendary</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-cyan-500 transition-colors disabled:opacity-50"
                                                >
                                                    {isSubmitting ? '...' : 'Issue Asset'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Cards List Display */}
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cards.map(card => (
                                        <div key={card.id} className="relative group bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden flex gap-4 p-4 hover:border-cyan-500/30 transition-all">
                                            <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0">
                                                <img src={card.photoUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <span className={cn(
                                                    "text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border inline-block w-fit mb-1",
                                                    card.rarity === 'legendary' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        card.rarity === 'epic' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                                            card.rarity === 'rare' ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" :
                                                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                )}>
                                                    {card.rarity}
                                                </span>
                                                <p className="text-xs font-black uppercase italic line-clamp-1">{card.characterName}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {cards.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl p-10">
                                            <Ghost className="w-10 h-10 mb-2" />
                                            <p className="text-[8px] uppercase tracking-widest font-black">No subjects issued</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Relations Section */}
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className="text-xl font-black uppercase italic tracking-wider flex items-center gap-3">
                                <Network className="w-5 h-5 text-amber-500" />
                                Intelligence Network
                            </h3>

                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
                                <form onSubmit={handleAddRelation} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-slate-500 uppercase font-black ml-1">Source Subject</label>
                                            <select
                                                required
                                                value={newRelation.sourceCardId}
                                                onChange={e => setNewRelation({ ...newRelation, sourceCardId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[10px] font-black uppercase outline-none"
                                            >
                                                <option value="">Select...</option>
                                                {cards.map(c => <option key={c.id} value={c.id}>{c.characterName}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] text-slate-500 uppercase font-black ml-1">Target Subject</label>
                                            <select
                                                required
                                                value={newRelation.targetCardId}
                                                onChange={e => setNewRelation({ ...newRelation, targetCardId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[10px] font-black uppercase outline-none"
                                            >
                                                <option value="">Select...</option>
                                                {cards.map(c => <option key={c.id} value={c.id}>{c.characterName}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] text-slate-500 uppercase font-black ml-1">Connection Type</label>
                                        <select
                                            value={newRelation.relationType}
                                            onChange={e => setNewRelation({ ...newRelation, relationType: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[10px] font-black uppercase outline-none"
                                        >
                                            <option value="rival">Rival / Đối thủ</option>
                                            <option value="mentor">Mentor / Sư phụ</option>
                                            <option value="student">Student / Đệ tử</option>
                                            <option value="ally">Ally / Đồng minh</option>
                                            <option value="enemy">Enemy / Kẻ thù</option>
                                            <option value="lover">Lover / Người yêu</option>
                                            <option value="teammate">Teammate / Đồng đội</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || cards.length < 2}
                                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                                    >
                                        Lock Connection
                                    </button>
                                </form>

                                <div className="space-y-2 pt-4 border-t border-white/5 overflow-y-auto max-h-[300px] custom-scrollbar">
                                    {relations.map((rel, idx) => {
                                        const source = cards.find(c => c.id === rel.sourceCardId);
                                        const target = cards.find(c => c.id === rel.targetCardId);
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-bold uppercase">
                                                <span className="text-white truncate max-w-[80px]">{source?.characterName}</span>
                                                <div className="flex-1 px-4 flex flex-col items-center">
                                                    <div className="w-full h-px bg-slate-700 relative">
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-700 rounded-full" />
                                                    </div>
                                                    <span className="text-amber-500 mt-1">{rel.relationType}</span>
                                                </div>
                                                <span className="text-white truncate max-w-[80px]">{target?.characterName}</span>
                                            </div>
                                        )
                                    })}
                                    {relations.length === 0 && (
                                        <p className="text-[8px] text-slate-700 text-center py-4 uppercase font-black italic">No connections established yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
