import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, KeyRound, ShieldCheck, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../assets/logo.png';
import loginBg from '../assets/login-bg.mp4';
import './Login.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('OTP sent to your email');
                setStep(2);
            } else {
                toast.error(data.message || 'Error sending OTP');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('OTP verified');
                setStep(3);
            } else {
                toast.error(data.message || 'Invalid OTP');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password updated successfully');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message || 'Error resetting password');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen login-page-container flex items-center justify-center p-4 font-sans relative">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={loginBg} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="login-card rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-[9999] pointer-events-auto overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#022683] blur-[100px] opacity-20"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#033aa0] blur-[100px] opacity-20"></div>

                <button
                    onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}
                    className="absolute top-6 left-6 text-[#888888] hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#022683] to-[#033aa0] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(2,38,131,0.3)]">
                            {step === 1 && <Mail className="w-6 h-6 text-white" />}
                            {step === 2 && <ShieldCheck className="w-6 h-6 text-white" />}
                            {step === 3 && <KeyRound className="w-6 h-6 text-white" />}
                        </div>
                    </div>
                    {/* Logo Image added at top to match Login page */}
                    <div className="mb-6">
                        <img src={logo} alt="Raju & Prasad Logo" className="h-12 mx-auto object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-6">
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'New Password'}
                    </h1>
                    <p className="text-[#888888] text-sm mb-6">
                        {step === 1 && 'Enter your email to receive a password reset OTP'}
                        {step === 2 && `We've sent a 6-digit code to ${email}`}
                        {step === 3 && 'Set a strong password for your account'}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#022683] ml-2">Email Address</label>
                            <div className="relative group transition-all duration-300">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white group-focus-within:text-[#033aa0] transition-colors pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 login-input rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all duration-300"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full login-button text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#022683]/20 hover:shadow-[#022683]/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1 text-center block">Verification Code</label>
                            <div className="relative group transition-all duration-300">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#033aa0] transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 login-input rounded-2xl text-white tracking-[0.75em] text-center font-bold text-2xl focus:outline-none transition-all duration-300 placeholder:tracking-normal placeholder:text-gray-700"
                                    maxLength={6}
                                    placeholder="000000"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full login-button text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#022683]/20 hover:shadow-[#022683]/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                className="text-xs text-gray-500 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">New Password</label>
                            <div className="relative group transition-all duration-300">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#033aa0] transition-colors pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 login-input rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Confirm Password</label>
                            <div className="relative group transition-all duration-300">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#033aa0] transition-colors pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 login-input rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full login-button text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#022683]/20 hover:shadow-[#022683]/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Update Password</span>
                                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
                <div className="mt-6 text-center text-xs text-[#022683]">
                    © 2026 Raju & Prasad – Chartered Accountants
                </div>

                {/* <div className="mt-2 pt-6 ">
                    <img src={logo} alt="Logo" className="h-12 mx-auto opacity-100 transition-all duration-500" />
                </div> */}
                {/* <div className="mb-6">
                    <img src={logo} alt="Raju & Prasad Logo" className="h-10 mx-auto object-contain" />
                </div> */}
            </div>
        </div>
    );
}
