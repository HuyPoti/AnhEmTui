'use client';

import { Member, RelationType } from '@/types/tree';
import { X, User, Calendar, Activity, Link2, FileText, Share2, Trash2, Edit, Save, Camera, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTreeStore } from '@/stores/treeStore';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { API_BASE_URL } from '@/config/api';

import { ImageCropper } from '@/components/common/ImageCropper';

interface NodeDetailPanelProps {
    member: Member | null;
    onClose: () => void;
}

export function NodeDetailPanel({ member, onClose }: NodeDetailPanelProps) {
    const updateNode = useTreeStore((state) => state.updateNode);
    const removeNode = useTreeStore((state) => state.removeNode);
    const removeEdge = useTreeStore((state) => state.removeEdge);
    const nodes = useTreeStore((state) => state.nodes);
    const edges = useTreeStore((state) => state.edges);

    const { isAuthenticated, token } = useAuthStore();
    const { t, language } = useLanguageStore();
    const { openPresentation } = usePresentationStore();
    const [uploading, setUploading] = useState(false);
    const isReadOnly = useTreeStore((state) => state.isReadOnly);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Member>>({});
    const [cropImage, setCropImage] = useState<string | null>(null);

    // Compute relationships
    const relationships = member ? edges.reduce((acc, edge) => {
        let connectedNodeId = '';
        let type = '';

        if (edge.source === member.id) {
            connectedNodeId = edge.target;
            type = (edge.data?.label as string) || (language === 'vi' ? 'Con' : 'Child');
        } else if (edge.target === member.id) {
            connectedNodeId = edge.source;
            type = (edge.data?.label as string) || (language === 'vi' ? 'Cha/Mẹ' : 'Parent');
        }

        if (connectedNodeId) {
            const connectedNode = nodes.find(n => n.id === connectedNodeId);
            if (connectedNode) {
                acc.push({
                    id: connectedNode.id,
                    data: connectedNode.data as Member,
                    type: type,
                    edgeId: edge.id
                });
            }
        }
        return acc;
    }, [] as { id: string, data: Member, type: string, edgeId: string }[]) : [];

    useEffect(() => {
        if (member) {
            setFormData(member);
            setIsEditing(false);
        }
    }, [member]);

    if (!member) return null;

    const handleSave = () => {
        if (member.id) {
            updateNode(member.id, formData);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        const confirmMsg = language === 'vi'
            ? 'Bạn có chắc chắn muốn xóa thành viên này? Hành động này không thể hoàn tác.'
            : 'Are you sure you want to delete this member? This action cannot be undone.';
        if (confirm(confirmMsg)) {
            removeNode(member.id);
            onClose();
        }
    };

    const handlePresentation = () => {
        const index = nodes.findIndex(n => n.id === member.id);
        if (index !== -1) {
            openPresentation(index);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setCropImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (blob: Blob) => {
        if (!member) return;

        // Convert blob to base64 for preview/guest mode
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64 = reader.result as string;

            if (isAuthenticated && token) {
                setUploading(true);
                setCropImage(null); // Close cropper
                try {
                    // Upload logic
                    const response = await fetch(`${API_BASE_URL}/images/upload`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ image: base64, folder: 'tree' })
                    });
                    const result = await response.json();
                    if (response.ok) {
                        const newPhotoUrl = result.url;
                        setFormData(prev => ({ ...prev, photoUrl: newPhotoUrl }));
                        updateNode(member.id, { photoUrl: newPhotoUrl });
                    } else {
                        throw new Error(result.message || 'Upload failed');
                    }
                } catch (error: any) {
                    alert((language === 'vi' ? 'Lỗi upload Cloudinary: ' : 'Cloudinary upload failed: ') + error.message);
                } finally {
                    setUploading(false);
                }
            } else {
                // Guest mode
                setFormData(prev => ({ ...prev, photoUrl: base64 }));
                setCropImage(null);
            }
        };
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-700 shadow-2xl z-[80] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center text-paper">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-classified" />
                        <h2 className="text-xl font-typewriter text-classified font-bold uppercase tracking-wider">
                            {t('member.profile')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Main Profile */}
                    <div className="flex flex-col items-center">
                        <div className="relative group/photo w-32 h-40 bg-aged-paper border-2 border-[#d1cfc7] mb-4 p-2 shadow-xl transform rotate-1">
                            {/* Tape effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-yellow-200/30 backdrop-blur-[1px] rotate-2 border border-yellow-300/10 z-10" />

                            <img
                                src={formData.photoUrl || member.photoUrl || '/placeholder-avatar.png'}
                                alt={member.fullName}
                                className={cn(
                                    "w-full h-full object-cover bg-slate-800 sepia-[0.2] contrast-110",
                                    !formData.isAlive && "grayscale brightness-75"
                                )}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?background=222&color=fff&name=' + member.fullName;
                                }}
                            />

                            {isEditing && (
                                <label className="absolute inset-x-2 inset-y-2 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity z-20">
                                    <Camera className="w-8 h-8 text-white mb-1" />
                                    <span className="text-[10px] text-white font-bold uppercase">{language === 'vi' ? 'Cập nhật' : 'Update'}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-2">
                                <input
                                    type="text"
                                    value={formData.fullName || ''}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white font-bold text-center font-typewriter uppercase"
                                    placeholder={t('member.full_name')}
                                />
                                <input
                                    type="text"
                                    value={formData.alias || ''}
                                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-classified font-typewriter text-sm text-center"
                                    placeholder={t('member.alias')}
                                />
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-white text-center font-typewriter uppercase tracking-tight">{member.fullName}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-classified font-typewriter text-sm italic">"{member.alias || 'N/A'}"</p>
                                    <button
                                        onClick={handlePresentation}
                                        className="p-1 bg-classified/10 text-classified hover:text-red-400 hover:bg-classified/20 rounded transition-all border border-classified/20"
                                        title={t('tree.presentation')}
                                    >
                                        <Play className="w-3 h-3 fill-current" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Section: Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-cyan-500 border-b border-slate-700 pb-1">
                            <User className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('member.personal_data')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-300">
                            <div>
                                <span className="block text-[10px] text-slate-500 uppercase">{t('member.gender')}</span>
                                {isEditing ? (
                                    <select
                                        value={formData.gender || 'male'}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-white"
                                    >
                                        <option value="male">{t('member.gender.male')}</option>
                                        <option value="female">{t('member.gender.female')}</option>
                                        <option value="other">{t('member.gender.other')}</option>
                                    </select>
                                ) : (
                                    member.gender === 'male' ? t('member.gender.male') : member.gender === 'female' ? t('member.gender.female') : t('member.gender.other')
                                )}
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-500 uppercase">{t('member.job')}</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.job || ''}
                                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-white"
                                    />
                                ) : (
                                    member.job || t('member.unknown')
                                )}
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-500 uppercase">{t('member.is_alive')}</span>
                                {isEditing ? (
                                    <select
                                        value={formData.isAlive ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, isAlive: e.target.value === 'true' })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-white"
                                    >
                                        <option value="true">{t('member.alive').toUpperCase()}</option>
                                        <option value="false">{t('member.deceased').toUpperCase()}</option>
                                    </select>
                                ) : (
                                    <span className={cn(member.isAlive ? "text-green-500" : "text-red-500")}>
                                        {member.isAlive ? t('member.alive').toUpperCase() : t('member.deceased').toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-500 uppercase">{t('member.birth_date')}</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.birthDate || ''}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-white"
                                        placeholder="YYYY-MM-DD"
                                    />
                                ) : (
                                    member.birthDate || t('member.unknown')
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Family Relations */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-cyan-500 border-b border-slate-700 pb-1 justify-between">
                            <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{t('member.relations')}</span>
                            </div>
                            <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-1.5 py-0.5 rounded-full font-mono">
                                {relationships.length}
                            </span>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {relationships.length === 0 ? (
                                <p className="text-xs text-slate-500 italic p-2 text-center">{t('member.no_relations')}</p>
                            ) : (
                                relationships.map((rel) => (
                                    <div key={rel.id} className="flex justify-between items-center text-sm bg-slate-800 p-2 rounded border-l-2 border-cyan-500 hover:bg-slate-750 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-700 overflow-hidden flex items-center justify-center">
                                                {rel.data.photoUrl ? (
                                                    <img
                                                        src={rel.data.photoUrl}
                                                        alt={rel.data.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-4 h-4 text-slate-500 opacity-50" />
                                                )}
                                            </div>
                                            <span className="text-slate-300">{rel.data.fullName}</span>
                                        </div>
                                        <span className="text-[10px] text-cyan-400 uppercase border border-cyan-900 px-1 bg-cyan-950/50">
                                            {rel.type}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Section: Description/Bio */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-cyan-500 border-b border-slate-700 pb-1">
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">{t('member.bio')}</span>
                        </div>
                        {isEditing ? (
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-2 text-xs text-slate-300 font-mono resize-none focus:ring-1 focus:ring-cyan-500"
                                placeholder={t('member.bio_placeholder')}
                            />
                        ) : (
                            <p className="text-xs text-slate-400 font-mono italic leading-relaxed">
                                {member.description || t('member.no_bio')}
                            </p>
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/80 flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                            >
                                <Save className="w-4 h-4" />
                                {t('common.save')}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                            >
                                <X className="w-4 h-4" />
                                {t('common.cancel')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                            >
                                <Edit className="w-4 h-4" />
                                {t('common.edit')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-500 hover:text-red-200 border border-red-900 font-bold py-2 px-4 rounded flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('common.delete')}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
            {
                cropImage && (
                    <ImageCropper
                        imageSrc={cropImage!}
                        onCancel={() => setCropImage(null)}
                        onCropComplete={handleCropComplete}
                    />
                )
            }
        </AnimatePresence >
    );
}
