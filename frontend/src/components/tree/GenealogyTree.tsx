'use client';

import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Panel,
    EdgeMouseHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from '@/components/tree/CustomNode';
import { NodeDetailPanel } from '@/components/tree/NodeDetailPanel';
import { ThemeCustomizer } from '@/components/tree/ThemeCustomizer';
import { ShareModal } from '@/components/auth/ShareModal';
import { LeftSidebar } from '@/components/sidebar/LeftSidebar';
import { SlideshowModal } from '@/components/presentation/SlideshowModal';
import { useTreeStore } from '@/stores/treeStore';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { Member } from '@/types/tree';
import { Settings2, X, Trash2, LogOut, User as UserIcon, Cloud, Share2, Home as HomeIcon, ChevronLeft, PlusCircle, Play, Globe, Palette, Lock, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenealogyTreeProps {
    onExit?: () => void;
}

const nodeTypes = {
    custom: CustomNode,
};

export function GenealogyTree({ onExit }: GenealogyTreeProps) {
    const nodes = useTreeStore((state) => state.nodes);
    const edges = useTreeStore((state) => state.edges);
    const treeId = useTreeStore((state) => state.treeId);
    const onNodesChange = useTreeStore((state) => state.onNodesChange);
    const onEdgesChange = useTreeStore((state) => state.onEdgesChange);
    const onConnect = useTreeStore((state) => state.onConnect);
    const addNode = useTreeStore((state) => state.addNode);
    const activeMemberId = useTreeStore((state) => state.activeMemberId);
    const setActiveMember = useTreeStore((state) => state.setActiveMember);
    const activeEdgeId = useTreeStore((state) => state.activeEdgeId);
    const setActiveEdge = useTreeStore((state) => state.setActiveEdge);
    const updateEdge = useTreeStore((state) => state.updateEdge);
    const removeEdge = useTreeStore((state) => state.removeEdge);
    const syncTree = useTreeStore((state) => state.syncTree);
    const exportTree = useTreeStore((state) => state.exportTree);
    const importTree = useTreeStore((state) => state.importTree);
    const backgroundColor = useTreeStore((state) => state.backgroundColor);
    const gridColor = useTreeStore((state) => state.gridColor);
    const setTreeSettings = useTreeStore((state) => state.setTreeSettings);
    const isReadOnly = useTreeStore((state) => state.isReadOnly);

    const { user, isAuthenticated, token, openAuthModal, logout } = useAuthStore();
    const { language, setLanguage, t } = useLanguageStore();
    const { openPresentation } = usePresentationStore();
    const [syncing, setSyncing] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const activeMember = nodes.find((n) => n.id === activeMemberId)?.data as Member | null;
    const activeEdge = edges.find((e) => e.id === activeEdgeId);

    const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
        setActiveEdge(edge.id);
    }, [setActiveEdge]);

    const closePanel = useCallback(() => {
        setActiveMember(null);
    }, [setActiveMember]);

    const handleSync = async () => {
        if (!isAuthenticated) {
            openAuthModal('login');
            return;
        }
        setSyncing(true);
        try {
            await syncTree(token!, treeId, language === 'vi' ? 'Cây Gia Phả Của Tôi' : 'My Family Tree');
            alert(t('tree.sync_success'));
        } catch (error: any) {
            alert(t('tree.sync_failed') + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await importTree(file);
            alert(t('tree.import_success'));
        } catch (error) {
            alert(t('tree.import_error'));
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const proOptions = { hideAttribution: true };

    return (
        <div className="flex h-screen w-full overflow-hidden transition-colors duration-500" style={{ backgroundColor }}>
            <LeftSidebar />
            <div className="flex-1 h-full relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeClick={onEdgeClick}
                    onNodeClick={(event, node) => setActiveMember(node.id)}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={proOptions}
                    draggable={!isReadOnly}
                    nodesConnectable={!isReadOnly}
                    nodesDraggable={!isReadOnly}
                    elementsSelectable={true}
                    style={{ backgroundColor }}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        style: { stroke: '#8b0000', strokeWidth: 3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' },
                        animated: true,
                    }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={40}
                        size={1}
                        color={gridColor}
                        className="opacity-50"
                    />
                    <Controls className="!bg-slate-800 !border-slate-700 !text-cyan-400 [&>button]:!border-b-slate-700 hover:[&>button]:!bg-slate-700" />
                    <MiniMap
                        nodeColor="#06b6d4"
                        maskColor="rgba(0,0,0, 0.7)"
                        className="!bg-slate-800 !border-slate-700"
                    />

                    <Panel position="top-left" className="flex flex-col gap-2">
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-1.5 rounded-2xl flex items-center gap-4 shadow-2xl">
                            <button
                                onClick={onExit}
                                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-slate-700/50"
                                title={t('nav.home')}
                            >
                                <HomeIcon className="w-5 h-5" />
                            </button>

                            <div className="h-8 w-px bg-slate-700/50" />

                            <div className="flex flex-col -space-y-1 pr-4">
                                <h1 className="text-white font-black font-mono text-lg tracking-tighter flex items-center gap-2">
                                    ANHEMTUI <span className="text-[10px] text-cyan-500 font-bold bg-cyan-900/30 px-1.5 py-0.5 rounded border border-cyan-500/20">v4.0</span>
                                </h1>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">{t('nav.tree')}</span>
                            </div>

                            <div className="h-8 w-px bg-slate-700/50" />

                            <div className="flex gap-1.5 pr-2">
                                {!isReadOnly && (
                                    <button
                                        onClick={() => {
                                            const newId = crypto.randomUUID();
                                            addNode({
                                                id: newId,
                                                fullName: t('tree.default_node_name'),
                                                gender: 'male',
                                                isAlive: true,
                                                job: t('tree.default_node_job'),
                                                alias: t('tree.default_node_alias'),
                                                birthDate: ''
                                            });
                                        }}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        {t('tree.add_node')}
                                    </button>
                                )}

                                <button
                                    onClick={() => openPresentation(0)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    {t('tree.presentation')}
                                </button>

                                {!isReadOnly && (
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border active:scale-95",
                                            syncing ? "bg-slate-800 text-slate-500 border-slate-700 animate-pulse" :
                                                isAuthenticated ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" :
                                                    "bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed"
                                        )}
                                    >
                                        <Cloud className={cn("w-3.5 h-3.5", syncing ? "animate-bounce" : "text-cyan-500")} />
                                        {syncing ? 'Sync' : t('tree.cloud_save')}
                                    </button>
                                )}

                                {!isReadOnly && (
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Share2 className="w-3.5 h-3.5 text-blue-500" />
                                        {t('tree.share')}
                                    </button>
                                )}

                                <div className="h-8 w-px bg-slate-700/50" />

                                <div className="flex gap-1.5 bg-slate-800/50 p-1 rounded-xl border border-slate-700/30">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImportFile}
                                        accept=".aet"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-10 h-10 bg-slate-900/50 hover:bg-slate-700 text-cyan-400 rounded-lg flex items-center justify-center transition-all border border-slate-700/50 hover:border-cyan-500/50 shadow-inner group"
                                        title={t('tree.import')}
                                    >
                                        <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={exportTree}
                                        className="w-10 h-10 bg-slate-900/50 hover:bg-slate-700 text-amber-400 rounded-lg flex items-center justify-center transition-all border border-slate-700/50 hover:border-amber-500/50 shadow-inner group"
                                        title={t('tree.export')}
                                    >
                                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {isReadOnly && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-500">
                                        <Lock className="w-3.5 h-3.5" />
                                        {language === 'vi' ? 'Chế độ xem' : 'View Only'}
                                    </div>
                                )}

                                <div className="h-8 w-px bg-slate-700/50" />

                                <div className="relative">
                                    <button
                                        onClick={() => setIsThemeOpen(!isThemeOpen)}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 border",
                                            isThemeOpen ? "bg-cyan-500 text-black border-cyan-400" : "bg-slate-800 text-slate-400 hover:text-white border-slate-700/50"
                                        )}
                                        title={language === 'vi' ? 'Chỉnh màu' : 'Custom Theme'}
                                    >
                                        <Palette className="w-5 h-5" />
                                    </button>

                                    {isThemeOpen && (
                                        <div className="absolute top-14 left-0 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                            <ThemeCustomizer />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <Panel position="top-right" className="flex gap-2 p-2">
                        {/* Language Switcher */}
                        <div className="flex bg-slate-800/80 border border-slate-700 rounded-lg p-1 backdrop-blur items-center gap-1">
                            <button
                                onClick={() => setLanguage('vi')}
                                className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold transition-all uppercase font-mono",
                                    language === 'vi' ? "bg-cyan-600 text-black" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                VI
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold transition-all uppercase font-mono",
                                    language === 'en' ? "bg-cyan-600 text-black" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                EN
                            </button>
                            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
                            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
                        </div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center">
                                        <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                                        {user?.fullName}
                                    </span>
                                </div>
                                <div className="w-[1px] h-4 bg-slate-700" />
                                <button
                                    onClick={logout}
                                    className="text-slate-400 hover:text-red-400 transition-colors p-1"
                                    title={t('auth.terminate')}
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-cyan-400 uppercase tracking-widest px-3 py-1.5 transition-colors border border-transparent hover:border-cyan-500/30 rounded"
                                >
                                    {t('auth.login')}
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="text-[10px] font-mono font-bold text-white bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/30 px-4 py-1.5 rounded uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                >
                                    {t('auth.register')}
                                </button>
                            </>
                        )}
                    </Panel>
                </ReactFlow>

                {/* Edge label editor */}
                {activeEdge && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 z-[60]">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold mb-1">{t('tree.relation_update')}</span>
                            <input
                                type="text"
                                value={activeEdge.label as string || ''}
                                onChange={(e) => updateEdge(activeEdge.id, { label: e.target.value })}
                                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 min-w-[200px]"
                                placeholder={t('tree.relation_placeholder')}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => removeEdge(activeEdge.id)}
                                className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors border border-red-500/30"
                                title={t('common.delete')}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setActiveEdge(null)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors border border-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                <NodeDetailPanel member={activeMember || null} onClose={closePanel} />

                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    treeId={treeId}
                />
                <SlideshowModal />
            </div>
        </div>
    );
}
