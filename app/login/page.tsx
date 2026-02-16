'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { uiSound } from '@/lib/ui-sounds';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Sparkles, Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if already logged in
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.push('/');
        };
        checkUser();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        uiSound?.click();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                uiSound?.error();
            } else {
                uiSound?.success();
                router.push('/');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
            uiSound?.error();
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Animated Background Particles - Google Research Style */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[180px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '4s' }}></div>

            <div className="w-full max-w-lg z-10">
                {/* Logo & Header */}
                <div className="text-center mb-10 transition-all duration-700">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-[0_0_80px_rgba(59,130,246,0.5)] mb-6 group">
                        <ShieldCheck className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Secure</span> Access
                    </h1>
                    <p className="text-gray-400 font-medium text-lg">
                        Enterprise portal for <span className="text-white font-bold">Eman Bakery 360</span>
                    </p>
                </div>

                {/* Login Card - Pure Glassmorphism */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-12 shadow-[0_0_80px_rgba(59,130,246,0.2)] relative group hover:shadow-[0_0_100px_rgba(59,130,246,0.3)] transition-all">
                    {/* Floating Badge */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-600 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 animate-bounce shadow-lg shadow-blue-500/40">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">AI Powered</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-3xl text-sm flex items-center gap-3 animate-shake backdrop-blur-md">
                                <div className="p-2 bg-red-500/20 rounded-full">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-300 ml-1 uppercase tracking-wider">Work Email</label>
                            <div className="relative group">
                                <Mail onMouseEnter={() => uiSound?.hover()} className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => uiSound?.hover()}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600 backdrop-blur-md hover:bg-white/10"
                                    placeholder="name@emanbakery.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Password</label>
                                <button
                                    type="button"
                                    onMouseEnter={() => uiSound?.hover()}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock onMouseEnter={() => uiSound?.hover()} className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => uiSound?.hover()}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600 backdrop-blur-md hover:bg-white/10"
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPassword(!showPassword);
                                        uiSound?.click();
                                    }}
                                    onMouseEnter={() => uiSound?.hover()}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            onMouseEnter={() => uiSound?.hover()}
                            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black py-5 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            {loading ? (
                                <span className="flex items-center justify-center gap-3 relative z-10">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span className="uppercase tracking-wider">Authenticating...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 relative z-10">
                                    <span className="uppercase tracking-wider">Sign In to Workspace</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Enterprise Security
                            </span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Protected by <span className="text-blue-400 font-bold">AES-256</span> encryption
                            <br />
                            Powered by <span className="text-purple-400 font-bold">Supabase Auth</span>
                        </p>
                    </div>
                </div>

                {/* Footer Link */}
                <p className="text-center mt-8 text-gray-500 text-sm">
                    New staff member? <span onMouseEnter={() => uiSound?.hover()} className="text-blue-400 font-bold hover:underline cursor-pointer transition-colors">Contact System Admin</span>
                </p>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
