'use client';

import {
    Handle,
    Position,
    NodeProps,
    Node,
    NodeToolbar
} from '@xyflow/react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { cn } from '@/lib/utils';
import { Member } from '@/types/tree';
import { memo } from 'react';
import { useTreeStore } from '@/stores/treeStore';
import { ArrowUpCircle, ArrowDownCircle, Users, Info, X } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

// This wrapper connects the React Flow logic (handles) with the UI (Card)
export const CustomNode = memo(({ data, selected }: NodeProps) => {
    const member = data as unknown as Member;
    const addParent = useTreeStore(state => state.addParent);
    const addChild = useTreeStore(state => state.addChild);
    const addSibling = useTreeStore(state => state.addSibling);
    const setActiveMember = useTreeStore(state => state.setActiveMember);
    const { language } = useLanguageStore();
    const nodeStyle = useTreeStore(state => state.nodeStyle);
    const isReadOnly = useTreeStore(state => state.isReadOnly);

    const displayBirthDate = formatDate(member.birthDate);

    return (
        <div className="relative flex flex-col items-center">
            {/* Target Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-2 !h-2 !bg-[#222] !border !border-[#444] hover:!bg-classified transition-colors"
            />

            <NodeToolbar isVisible={selected && !isReadOnly} position={Position.Top} className="flex gap-2 bg-slate-800 p-1 rounded-full border border-slate-600 shadow-xl -mt-4">
                <button
                    onClick={() => addParent(member.id)}
                    className="p-2 hover:bg-slate-700 rounded-full text-cyan-400 tooltip-trigger"
                    title={language === 'vi' ? 'Thêm Cha/Mẹ' : 'Add Parent'}
                >
                    <ArrowUpCircle className="w-5 h-5" />
                </button>
                <button
                    onClick={() => addSibling(member.id)}
                    className="p-2 hover:bg-slate-700 rounded-full text-cyan-400"
                    title={language === 'vi' ? 'Thêm Lân Cận' : 'Add Sibling'}
                >
                    <Users className="w-5 h-5" />
                </button>
                <button
                    onClick={() => addChild(member.id)}
                    className="p-2 hover:bg-slate-700 rounded-full text-cyan-400"
                    title={language === 'vi' ? 'Thêm Con' : 'Add Child'}
                >
                    <ArrowDownCircle className="w-5 h-5" />
                </button>
                <div className="w-px bg-slate-600 mx-1" />
                <button
                    onClick={() => setActiveMember(member.id)}
                    className="p-2 hover:bg-cyan-900/50 rounded-full text-cyan-400 border border-cyan-500/30"
                    title={language === 'vi' ? 'Xem Chi Tiết' : 'View Details'}
                >
                    <Info className="w-5 h-5" />
                </button>
            </NodeToolbar>

            {/* UI Variants base on nodeStyle */}
            {nodeStyle === 'polaroid' && (
                <div className={cn(
                    "group relative w-24 h-28 bg-[#fdfbf7] p-1 shadow-[5px_5px_15px_rgba(0,0,0,0.4)] transition-all duration-300 transform border border-[#d1cfc7]",
                    selected ? "ring-2 ring-classified scale-110 -rotate-2 z-10" : "hover:scale-105 hover:rotate-1 shadow-2xl"
                )}
                    style={{
                        backgroundImage: `url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")`
                    }}>
                    {/* Tape effect on top */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-yellow-200/40 backdrop-blur-[1px] -rotate-1 border border-yellow-300/20 shadow-sm z-20 pointer-events-none" />

                    <div className="w-full h-20 bg-[#1a1a1a] overflow-hidden border border-black/10">
                        {member.photoUrl ? (
                            <img
                                src={member.photoUrl}
                                alt={member.fullName}
                                className="w-full h-full object-cover sepia-[0.3] contrast-125 brightness-90 grayscale-[0.2]"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?background=1a1a1a&color=fff&name=' + member.fullName;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                                <Users className="w-10 h-10 text-[#444] opacity-50" />
                            </div>
                        )}
                    </div>

                    <div className="mt-1 h-6 flex flex-col justify-center items-center overflow-hidden">
                        <p className="text-[9px] font-typewriter font-bold text-ink leading-tight text-center px-0.5 uppercase">
                            {member.fullName}
                        </p>
                        {member.alias && (
                            <p className="text-[7px] font-typewriter text-classified text-center truncate italic">
                                "{member.alias}"
                            </p>
                        )}
                        {/* Display Date */}
                        {displayBirthDate && <p className="text-[6px] text-slate-500 text-center leading-none">{displayBirthDate}</p>}
                    </div>

                    {/* Status Indicator: "DECEASED" Rubber Stamp */}
                    {!member.isAlive && (
                        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                            <div className="border-4 border-classified/60 px-2 py-0.5 rounded -rotate-[25deg] shadow-sm transform scale-90">
                                <span className="text-[10px] text-classified/80 font-typewriter font-black tracking-widest uppercase bg-[#fdfbf7]/40 px-1">
                                    {language === 'vi' ? 'QUÁ CỐ' : 'DECEASED'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Pin effect */}
                    <div className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-red-600 shadow-inner z-20" />
                </div>
            )}

            {nodeStyle === 'classic' && (
                <div className={cn(
                    "relative w-28 bg-white border-2 p-1 transition-all duration-300 shadow-md flex flex-col items-center",
                    selected ? "border-cyan-500 scale-110 z-10 shadow-lg" : "border-slate-300 hover:border-slate-400"
                )}>
                    <div className="w-full h-24 bg-slate-100 overflow-hidden rounded-sm border border-slate-200">
                        <img
                            src={member.photoUrl || `https://ui-avatars.com/api/?background=cbd5e1&color=64748b&name=${member.fullName}`}
                            alt={member.fullName}
                            className={cn("w-full h-full object-cover", !member.isAlive && "grayscale")}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <div className="w-full p-1 text-center">
                        <p className="text-[10px] font-bold text-slate-800 truncate uppercase">
                            {member.fullName}
                        </p>
                        {member.alias && (
                            <p className="text-[8px] text-cyan-600 font-medium truncate">
                                {member.alias}
                            </p>
                        )}
                        {displayBirthDate && <p className="text-[8px] text-slate-500">{displayBirthDate}</p>}
                    </div>
                    {!member.isAlive && (
                        <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                    )}
                </div>
            )}

            {nodeStyle === 'modern' && (
                <div className={cn(
                    "relative w-20 h-20 rounded-full transition-all duration-300 p-1 group",
                    selected ? "ring-4 ring-cyan-500 scale-110 z-10" : "hover:scale-105"
                )}>
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg bg-slate-800">
                        <img
                            src={member.photoUrl || `https://ui-avatars.com/api/?background=0f172a&color=fff&name=${member.fullName}`}
                            alt={member.fullName}
                            className={cn("w-full h-full object-cover", !member.isAlive && "grayscale brightness-50")}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>

                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/90 text-white text-[8px] font-bold rounded-full whitespace-nowrap border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.fullName}
                        {displayBirthDate && <span className="block text-[6px] font-normal text-slate-300">{displayBirthDate}</span>}
                    </div>

                    {!member.isAlive && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center">
                            <X className="w-2 h-2 text-white" />
                        </div>
                    )}
                </div>
            )}

            {/* Source Handle (Bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-2 !h-2 !bg-[#222] !border !border-[#444] hover:!bg-classified transition-colors"
            />

            {/* Side Handles for horizontal connections (e.g. Spouse) */}
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-black !-left-1.5"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left-target"
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-black !-left-1.5"
            />

            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-black !-right-1.5"
            />
            <Handle
                type="target"
                position={Position.Right}
                id="right-target"
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-black !-right-1.5"
            />
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
