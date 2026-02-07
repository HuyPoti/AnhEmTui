'use client';

import React from 'react';
import { Member } from '@/types/tree';
import { cn } from '@/lib/utils';
import { Fingerprint, Scan, Target, Activity } from 'lucide-react';
import Image from 'next/image';

interface ConanProfileCardProps {
    member: Member;
    className?: string;
    onClick?: () => void;
}

export function ConanProfileCard({ member, className, onClick }: ConanProfileCardProps) {
    // Conan theme colors often involve blue/cyan electric overlays on dark backgrounds or gritty paper style.
    // We'll go with a "Database Entry" look - High contrast, technical.

    const isDead = !member.isAlive;

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative w-80 bg-neutral-900 border-2 border-slate-600 text-slate-200 font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden transition-all hover:scale-105 hover:border-cyan-400 cursor-pointer group select-none",
                className
            )}
        >
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}
            />

            {/* Header Bar */}
            <div className="bg-slate-800 p-2 border-b border-slate-600 flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest text-cyan-400">CONFIDENTIAL</span>
                <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
            </div>

            <div className="p-4 relative z-10">
                {/* Top Section: Photo & ID */}
                <div className="flex gap-4 mb-4">
                    <div className="relative w-24 h-32 border border-cyan-500/50 bg-black/50 shrink-0 overflow-hidden">
                        {/* Crosshairs overlay */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                        {member.photoUrl ? (
                            <img
                                src={member.photoUrl}
                                alt={member.fullName}
                                className={cn("w-full h-full object-cover filter", isDead && "grayscale contrast-125")}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-cyan-700">
                                <Fingerprint className="w-12 h-12 opacity-50" />
                            </div>
                        )}

                        {/* Scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1 w-full animate-[scan_2s_linear_infinite]" />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Subject Name</p>
                            <h3 className="text-lg font-bold text-white leading-tight uppercase relative inline-block">
                                {member.fullName}
                                {/* Glowing text effect */}
                                <span className="absolute inset-0 blur-sm text-cyan-400 opacity-0 group-hover:opacity-50 transition-opacity" aria-hidden="true">{member.fullName}</span>
                            </h3>
                        </div>

                        {member.alias && (
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Alias</p>
                                <p className="text-sm text-cyan-300 italic">"{member.alias}"</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Scan className="w-4 h-4 text-cyan-600" />
                            <span className="text-xs text-cyan-600">{member.id.substring(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700 pt-3">
                    <div className="bg-slate-800/50 p-1.5 border-l-2 border-white/20">
                        <span className="block text-[9px] text-slate-500 uppercase">Gender</span>
                        <span className="text-slate-200 uppercase">{member.gender}</span>
                    </div>
                    <div className="bg-slate-800/50 p-1.5 border-l-2 border-white/20">
                        <span className="block text-[9px] text-slate-500 uppercase">Status</span>
                        <div className="flex items-center gap-1">
                            <Activity className={cn("w-3 h-3", isDead ? "text-red-500" : "text-green-500")} />
                            <span className={cn("uppercase font-bold", isDead ? "text-red-500" : "text-green-500")}>
                                {isDead ? "DECEASED" : "ACTIVE"}
                            </span>
                        </div>
                    </div>
                    {member.birthDate && (
                        <div className="bg-slate-800/50 p-1.5 border-l-2 border-white/20">
                            <span className="block text-[9px] text-slate-500 uppercase">Date of Birth</span>
                            <span className="text-slate-200">{member.birthDate}</span>
                        </div>
                    )}
                    {member.job && (
                        <div className="col-span-2 bg-slate-800/50 p-1.5 border-l-2 border-white/20">
                            <span className="block text-[9px] text-slate-500 uppercase">Occupation</span>
                            <span className="text-slate-200">{member.job}</span>
                        </div>
                    )}
                </div>

                {/* Target Overlay (Decorative) */}
                <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-cyan-900/20 rotate-45" />

                {/* Deceased Stamp */}
                {isDead && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-red-600 text-red-600 px-4 py-1 text-2xl font-black -rotate-12 opacity-80 mix-blend-screen whitespace-nowrap z-20 pointer-events-none">
                        DECEASED
                    </div>
                )}
            </div>

            {/* Footer Bar */}
            <div className="bg-black p-1 border-t border-slate-600 flex justify-between px-2 text-[9px] text-slate-500">
                <span>LEVEL 5 CLEARANCE</span>
                <span>DB.VER.2.0</span>
            </div>
        </div>
    );
}
