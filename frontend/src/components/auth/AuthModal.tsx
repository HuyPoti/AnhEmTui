'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useToastStore } from '@/stores/toastStore';
import { API_BASE_URL } from '@/config/api';
import { cn } from '@/lib/utils';

export function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, authView, setAuthView, setUser } = useAuthStore();
    const { t, language } = useLanguageStore();
    const toast = useToastStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [loading, setLoading] = useState(false);

    if (!isAuthModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (authView === 'forgot-password') {
                if (forgotStep === 1) {
                    // Step 1: Send OTP
                    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message || 'Failed to send OTP');
                    setForgotStep(2);
                    toast.success(language === 'vi' ? 'Mã OTP đã được gửi về Gmail của bạn' : 'OTP code has been sent to your Gmail');
                } else {
                    // Step 2: Reset Password
                    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, otp, newPassword }),
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message || 'Reset password failed');
                    toast.success(language === 'vi' ? 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' : 'Password reset successful! Please login again.');
                    setAuthView('login');
                    setForgotStep(1);
                }
                return;
            }

            if (authView === 'verify-email') {
                const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp }),
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.message || 'Verification failed');

                alert(language === 'vi' ? 'Xác thực thành công! Đang đăng nhập...' : 'Verification successful! Logging in...');

                // Auto login
                const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const loginResult = await loginResponse.json();

                if (loginResponse.ok) {
                    setUser(loginResult.user, loginResult.token);
                    closeAuthModal();
                } else {
                    setAuthView('login');
                }
                return;
            }

            const url = authView === 'login'
                ? `${API_BASE_URL}/auth/login`
                : `${API_BASE_URL}/auth/register`;
            const body = authView === 'login'
                ? { email, password }
                : { email, password, fullName };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Authentication failed');
            }

            if (authView === 'register') {
                toast.success(result.message);
                setAuthView('verify-email');
                return;
            }

            setUser(result.user, result.token);
            closeAuthModal();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeAuthModal}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden"
                >
                    {/* Top Accent Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

                    <div className="p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Terminal className="w-6 h-6 text-cyan-400" />
                                    {authView === 'login' && (language === 'vi' ? 'YÊU CẦU TRUY CẬP' : 'ACCESS REQUIRED')}
                                    {authView === 'register' && (language === 'vi' ? 'ĐĂNG KÝ MỚI' : 'NEW CLEARANCE')}
                                    {authView === 'forgot-password' && (language === 'vi' ? 'KHÔI PHỤC MẬT KHẨU' : 'PASSWORD RECOVERY')}
                                    {authView === 'verify-email' && (language === 'vi' ? 'XÁC THỰC DANH TÍNH' : 'IDENTITY VERIFICATION')}
                                </h2>
                                <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">
                                    {authView === 'login' && (language === 'vi' ? 'Nhập thông tin để tiếp tục' : 'Enter your credentials to proceed')}
                                    {authView === 'register' && (language === 'vi' ? 'Tạo tài khoản để lưu trữ dữ liệu' : 'Create an account to save records')}
                                    {authView === 'verify-email' && (language === 'vi' ? 'Nhập mã OTP được gửi về email' : 'Enter OTP sent to your email')}
                                    {authView === 'forgot-password' && (forgotStep === 1
                                        ? (language === 'vi' ? 'Nhập email để nhận mã OTP' : 'Enter email to receive OTP')
                                        : (language === 'vi' ? 'Nhập mã OTP và mật khẩu mới' : 'Enter OTP and your new password'))}
                                </p>
                            </div>
                            <button
                                onClick={closeAuthModal}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authView === 'register' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] text-cyan-400 font-mono uppercase font-bold ml-1">{language === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                            placeholder={language === 'vi' ? 'Tên điệp viên' : 'Agent Name'}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {(authView !== 'forgot-password' || forgotStep === 1) && (authView as string) !== 'verify-email' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] text-cyan-400 font-mono uppercase font-bold ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                            placeholder="agent@agency.io"
                                            required
                                            disabled={(authView as string) === 'verify-email'}
                                        />
                                    </div>
                                </div>
                            )}

                            {authView !== 'forgot-password' && (authView as string) !== 'verify-email' && (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-cyan-400 font-mono uppercase font-bold ml-1">{language === 'vi' ? 'Mật mã bảo mật' : 'Secure Key'}</label>
                                        {authView === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => setAuthView('forgot-password')}
                                                className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono uppercase transition-colors"
                                            >
                                                {language === 'vi' ? 'Quên?' : 'Forgot?'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {authView === 'verify-email' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] text-cyan-400 font-mono uppercase font-bold ml-1">OTP Code</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                            placeholder={language === 'vi' ? 'Nhập mã OTP 6 số' : 'Enter 6-digit OTP'}
                                            required
                                        />
                                    </div>
                                    <div className="text-center mt-2">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await fetch(`${API_BASE_URL}/auth/resend-verification-otp`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ email }),
                                                    });
                                                    toast.success(language === 'vi' ? 'Đã gửi lại mã OTP' : 'OTP resent');
                                                } catch (e) {
                                                    toast.error('Error resending OTP');
                                                }
                                            }}
                                            className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono uppercase underline"
                                        >
                                            {language === 'vi' ? 'Gửi lại mã?' : 'Resend Code?'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {authView === 'forgot-password' && forgotStep === 2 && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-cyan-400 font-mono uppercase font-bold ml-1">OTP Code</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                                placeholder={language === 'vi' ? 'Nhập mã OTP 6 số' : 'Enter 6-digit OTP'}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-cyan-400 font-mono uppercase font-bold ml-1">{language === 'vi' ? 'Mật mã mới' : 'New Secure Key'}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 mt-6",
                                    loading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {authView === 'login' && (language === 'vi' ? 'KHỞI CHẠY ĐĂNG NHẬP' : 'INITIALIZE LOGIN')}
                                        {authView === 'register' && (language === 'vi' ? 'TẠO TÀI KHOẢN' : 'CREATE ACCOUNT')}
                                        {authView === 'verify-email' && (language === 'vi' ? 'XÁC THỰC NGAY' : 'VERIFY NOW')}
                                        {authView === 'forgot-password' && (forgotStep === 1
                                            ? (language === 'vi' ? 'GỬI MÃ OTP' : 'SEND OTP CODE')
                                            : (language === 'vi' ? 'ĐẶT LẠI MẬT KHẨU' : 'RESET PASSWORD'))}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Toggle View */}
                        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                            <p className="text-slate-500 text-xs">
                                {authView === 'login'
                                    ? (language === 'vi' ? "Chưa có quyền truy cập?" : "Don't have clearance?")
                                    : (language === 'vi' ? "Đã có quyền truy cập?" : "Already have clearance?")}
                                <button
                                    onClick={() => {
                                        setAuthView(authView === 'login' ? 'register' : 'login');
                                        setForgotStep(1);
                                    }}
                                    className="ml-2 text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-tighter transition-colors"
                                >
                                    {authView === 'login'
                                        ? (language === 'vi' ? 'Yêu cầu mở mới' : 'Request Access')
                                        : (language === 'vi' ? 'Kết nối tài khoản' : 'Connect Existing')}
                                </button>
                            </p>
                        </div>

                        {/* Security Footer */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-600 font-mono">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{language === 'vi' ? 'PHIÊN LÀM VIỆC ĐƯỢC MÃ HÓA ĐẦU CUỐI' : 'END-TO-END ENCRYPTED SESSION'}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
