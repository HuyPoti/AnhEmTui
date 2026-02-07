'use client';

import React from 'react';
import { useTreeStore } from '@/stores/treeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { Pipette, Palette, Grid3X3, Trash2, Camera, User, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_THEMES = [
    {
        name: { vi: 'Bảng Bần', en: 'Cork Board' },
        bg: '#3d2b1f',
        grid: '#1a120b'
    },
    {
        name: { vi: 'Đêm Noir', en: 'Noir Night' },
        bg: '#121212',
        grid: '#222222'
    },
    {
        name: { vi: 'Giấy Cũ', en: 'Aged Paper' },
        bg: '#fdfbf7',
        grid: '#e0d8c0'
    },
    {
        name: { vi: 'Xám Hiện Đại', en: 'Modern Gray' },
        bg: '#1e293b',
        grid: '#334155'
    }
];

export function ThemeCustomizer() {
    const backgroundColor = useTreeStore((state) => state.backgroundColor);
    const gridColor = useTreeStore((state) => state.gridColor);
    const nodeStyle = useTreeStore((state) => state.nodeStyle);
    const setTreeSettings = useTreeStore((state) => state.setTreeSettings);
    const isReadOnly = useTreeStore((state) => state.isReadOnly);
    const { language, t } = useLanguageStore();

    if (isReadOnly) return null;

    return (
        <div className="p-4 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-xs font-black font-typewriter text-white uppercase tracking-widest flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-500" />
                {language === 'vi' ? 'TÙY CHỈNH GIAO DIỆN' : 'BOARD SETTINGS'}
            </h3>

            {/* Presets */}
            <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase">{language === 'vi' ? 'Chủ đề có sẵn' : 'Presets'}</p>
                <div className="grid grid-cols-2 gap-2">
                    {PRESET_THEMES.map((theme) => (
                        <button
                            key={theme.name.en}
                            onClick={() => setTreeSettings({ backgroundColor: theme.bg, gridColor: theme.grid })}
                            className={cn(
                                "group relative h-12 rounded-lg border-2 transition-all overflow-hidden",
                                backgroundColor === theme.bg ? "border-cyan-500" : "border-slate-800 hover:border-slate-600"
                            )}
                            style={{ backgroundColor: theme.bg }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">
                                    {language === 'vi' ? theme.name.vi : theme.name.en}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Node Styles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">{language === 'vi' ? 'Phong cách thẻ' : 'Member Style'}</p>
                <div className="flex gap-2">
                    {[
                        { id: 'polaroid', icon: Camera, label: { vi: 'Polaroid', en: 'Polaroid' } },
                        { id: 'classic', icon: User, label: { vi: 'Cổ điển', en: 'Classic' } },
                        { id: 'modern', icon: Layout, label: { vi: 'Hiện đại', en: 'Modern' } }
                    ].map((style) => (
                        <button
                            key={style.id}
                            onClick={() => setTreeSettings({ nodeStyle: style.id as any })}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                                nodeStyle === style.id ? "bg-cyan-600/20 border-cyan-500 text-cyan-400" : "bg-slate-800/50 border-transparent text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <style.icon className="w-5 h-5" />
                            <span className="text-[8px] font-bold uppercase">{language === 'vi' ? style.label.vi : style.label.en}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                        <span className="flex items-center gap-1"><Pipette className="w-3 h-3" /> Background</span>
                        <span className="font-mono text-cyan-500">{backgroundColor}</span>
                    </div>
                    <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setTreeSettings({ backgroundColor: e.target.value })}
                        className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                        <span className="flex items-center gap-1"><Grid3X3 className="w-3 h-3" /> Grid Spots</span>
                        <span className="font-mono text-cyan-500">{gridColor}</span>
                    </div>
                    <input
                        type="color"
                        value={gridColor}
                        onChange={(e) => setTreeSettings({ gridColor: e.target.value })}
                        className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden"
                    />
                </div>
            </div>

            <div className="text-[9px] text-slate-600 italic font-mono leading-tight bg-slate-950/50 p-2 rounded">
                {language === 'vi'
                    ? '* Cài đặt màu sẽ được lưu lại cho lần truy cập sau.'
                    : '* Theme settings are persisted locally for your next visit.'}
            </div>
        </div>
    );
}
