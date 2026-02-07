'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, Zap, Shield, Globe, MousePointer2, ChevronRight, PlayCircle, Lock, Package, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { PublicAccessModal } from '@/components/auth/PublicAccessModal';
import { cn } from '@/lib/utils';

interface LandingPageProps {
    onStartDemo: () => void;
}

export function LandingPage({ onStartDemo }: LandingPageProps) {
    const { openAuthModal } = useAuthStore();
    const { t, language, setLanguage } = useLanguageStore();
    const [isPublicAccessOpen, setIsPublicAccessOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            {/* Gradient Orbs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_rgba(8,145,178,0.3)]">
                        <TreePine className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold font-mono tracking-tighter text-white uppercase italic">
                        {t('app.title')}
                    </span>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Language Switcher */}
                    <div className="flex bg-slate-900/50 border border-slate-800 rounded-full p-1 items-center">
                        <button
                            onClick={() => setLanguage('vi')}
                            className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold transition-all uppercase",
                                language === 'vi' ? "bg-cyan-600 text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            VI
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold transition-all uppercase",
                                language === 'en' ? "bg-cyan-600 text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            EN
                        </button>
                    </div>

                    <button
                        onClick={() => openAuthModal('login')}
                        className="text-sm font-medium hover:text-cyan-400 transition-colors hidden md:block"
                    >
                        {t('auth.login')}
                    </button>
                    <button
                        onClick={() => openAuthModal('register')}
                        className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-cyan-400 transition-all active:scale-95"
                    >
                        {language === 'vi' ? 'Tham gia ngay' : 'Join Now'}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-4 text-center">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold font-mono uppercase tracking-widest mb-6">
                            {language === 'vi' ? 'CÔNG NGHỆ GIA PHẢ THẾ HỆ MỚI' : 'Next Generation Genealogy'}
                        </span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase italic">
                            {language === 'vi' ? (
                                <>
                                    KẾT NỐI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">HUYẾT THỐNG</span>
                                    <br />THỜI ĐẠI 4.0
                                </>
                            ) : (
                                <>
                                    CONNECTING <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ROOTS</span>
                                    <br />FOR 4.0 ERA
                                </>
                            )}
                        </h1>
                        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 font-medium leading-relaxed">
                            {language === 'vi'
                                ? 'Nền tảng quản lý gia phả thông minh, lưu trữ bảo mật trên đám mây với giao diện tương tác hiện đại và công nghệ trình chiếu Detective Profile.'
                                : 'Modern genealogy platform with smart cloud storage, interactive UI, and Detective Profile presentation mode.'}
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={onStartDemo}
                                className="group relative w-full md:w-auto px-8 py-4 bg-cyan-500 text-black font-black uppercase tracking-tight rounded-xl overflow-hidden active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-101%] group-hover:translate-x-0 transition-transform skew-x-12" />
                                <span className="relative flex items-center justify-center gap-2 text-lg">
                                    <PlayCircle className="w-5 h-5" />
                                    {t('nav.demo')}
                                </span>
                            </button>

                            <button
                                onClick={() => window.location.href = '/collections'}
                                className="w-full md:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-tight rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Package className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
                                {language === 'vi' ? 'Bộ sưu tập Thẻ' : 'Character Collections'}
                            </button>

                            <button
                                onClick={() => setIsPublicAccessOpen(true)}
                                className="w-full md:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-tight rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Search className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
                                {language === 'vi' ? 'Truy cập Gia phả' : 'Access Tree'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                <PublicAccessModal
                    isOpen={isPublicAccessOpen}
                    onClose={() => setIsPublicAccessOpen(false)}
                    onSuccess={() => {
                        setIsPublicAccessOpen(false);
                        onStartDemo();
                    }}
                />
            </section>

            {/* Features */}
            <section className="relative z-10 py-24 bg-slate-950 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-cyan-400" />}
                            title={language === 'vi' ? 'Trình chiếu Đỉnh cao' : 'Top Presentation'}
                            description={language === 'vi'
                                ? 'Chiêm ngưỡng hồ sơ nhân vật phong cách Conan. Tự động quét và tiết lộ dữ liệu thành viên.'
                                : 'Experience Conan-style character profiles. Automatic scanning and revealing of member data.'}
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-blue-400" />}
                            title={language === 'vi' ? 'Bảo mật Đám mây' : 'Cloud Security'}
                            description={language === 'vi'
                                ? 'Dữ liệu của bạn được mã hóa và bảo mật tuyệt đối trên nền tảng đám mây tiên tiến nhất.'
                                : 'Your data is encrypted and absolutely secured on the most advanced cloud platform.'}
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-indigo-400" />}
                            title={language === 'vi' ? 'Đa ngôn ngữ' : 'Multilingual'}
                            description={language === 'vi'
                                ? 'Hỗ trợ Tiếng Việt & Tiếng Anh, giúp kết nối người thân ở khắp mọi nơi trên thế giới.'
                                : 'Supports Vietnamese & English, helping connect relatives everywhere around the world.'}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-slate-900 text-center">
                <p className="text-slate-600 text-sm font-mono italic">
                    © 2026 {t('app.title').toUpperCase()} ENGINE. ALL RIGHTS RESERVED. [STATUS: ENCRYPTED]
                </p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all group">
            <div className="mb-6 p-3 bg-slate-950 rounded-xl w-fit group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight font-mono italic">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {description}
            </p>
        </div>
    );
}
