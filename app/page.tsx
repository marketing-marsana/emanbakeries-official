'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { uiSound } from '@/lib/ui-sounds';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  CreditCard,
  CalendarDays,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Star,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // IF LOGGED IN: SHOW THE PORTAL HUB
  if (session) {
    const portalApps = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        desc: 'Strategic overview with real-time KPI analytical cards.',
        icon: <LayoutDashboard className="w-10 h-10" />,
        href: '/dashboard',
        color: 'from-blue-600 to-indigo-600',
        glow: 'shadow-blue-500/20'
      },
      {
        id: 'employees',
        name: 'Employee Hub',
        desc: 'Comprehensive staff database with digital dossiers.',
        icon: <Users className="w-10 h-10" />,
        href: '/employees',
        color: 'from-emerald-600 to-teal-600',
        glow: 'shadow-emerald-500/20'
      },
      {
        id: 'compliance',
        name: 'Compliance',
        desc: 'Automated monitoring for Iqama & Legal expirations.',
        icon: <ShieldAlert className="w-10 h-10" />,
        href: '/compliance',
        color: 'from-orange-600 to-rose-600',
        glow: 'shadow-orange-500/20'
      },
      {
        id: 'payroll',
        name: 'Payroll Engine',
        desc: 'Advanced salary calculations & WPS integration.',
        icon: <CreditCard className="w-10 h-10" />,
        href: '/payroll',
        color: 'from-purple-600 to-violet-600',
        glow: 'shadow-purple-500/20'
      },
      {
        id: 'leaves',
        name: 'Vacation Logs',
        desc: 'Staff leave tracking & Exit/Re-entry management.',
        icon: <CalendarDays className="w-10 h-10" />,
        href: '/leaves',
        color: 'from-amber-600 to-orange-600',
        glow: 'shadow-amber-500/20'
      }
    ];

    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
        {/* Hub Header */}
        <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Eman Bakery <span className="text-indigo-400">360</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-bold text-white leading-none">{session.user.email}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Super Admin Account</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors border border-white/5 group"
              >
                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> System Hub
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Workspace Central</h2>
            <p className="text-slate-400 max-w-2xl font-medium">Select a specialized module below to manage your operations at Eman Bakery. Your session is secured with enterprise encryption.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portalApps.map((app) => (
              <Link key={app.id} href={app.href} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${app.color} rounded-[2rem] opacity-0 group-hover:opacity-20 blur-xl transition duration-500`}></div>
                <div className="relative bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 h-full flex flex-col transition-all duration-300 group-hover:-translate-y-2 group-hover:border-white/20 shadow-2xl">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg ${app.glow}`}>
                    {app.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{app.name}</h3>
                  <p className="text-slate-400 font-medium mb-8 flex-1 leading-relaxed">{app.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest group-hover:gap-4 transition-all">
                    Launch Module <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats / Info Row */}
          <div className="mt-16 bg-gradient-to-r from-indigo-600/10 to-transparent rounded-[2.5rem] border border-white/5 p-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left border-r border-white/5 pr-8">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-3">System Identity</p>
                <p className="text-lg font-bold text-white leading-snug">Global ERP v4.0.0-Stable</p>
              </div>
              <div className="text-center md:text-left border-r border-white/5 pr-8">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3">Database Connection</p>
                <p className="text-lg font-bold text-white leading-snug">Supabase Cloud (Active)</p>
              </div>
              <div className="text-center md:text-left border-r border-white/5 pr-8">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-3">Security Protocol</p>
                <p className="text-lg font-bold text-white leading-snug">AES-256 RLS Enabled</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-3">Region</p>
                <p className="text-lg font-bold text-white leading-snug">Saudi Arabia - Riyadh</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-12 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm font-medium">© 2024 Eman Bakeries Group. Engineered for excellence.</p>
        </footer>
      </div>
    );
  }

  // IF LOGGED OUT: SHOW GOOGLE RESEARCH-INSPIRED LANDING PAGE
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden font-sans relative">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Nav - Pure Black Glassmorphism */}
      <nav className="fixed w-full top-0 h-20 bg-black/70 backdrop-blur-2xl z-[100] border-b border-white/10 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Eman Bakery <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">360</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" onMouseEnter={() => uiSound?.hover()} className="text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-widest">Platform</a>
            <a href="#features" onMouseEnter={() => uiSound?.hover()} className="text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-widest">Technology</a>
            <Link href="/login" onClick={() => uiSound?.click()} onMouseEnter={() => uiSound?.hover()} className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center gap-2">
              Staff Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            className="lg:hidden p-3 bg-white/5 backdrop-blur-md rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition-all border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-[90] lg:hidden animate-fadeIn">
          <div className="flex flex-col items-center justify-center h-full gap-8 p-6 text-center">
            <Link href="/login" className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl text-xl font-bold shadow-2xl shadow-blue-500/40">Login to Portal</Link>
          </div>
        </div>
      )}

      {/* Hero Section - Google Research Style */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
            <Sparkles className="w-3 h-3" /> Enterprise HR System
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] max-w-5xl mx-auto">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-shift">Workforce</span> Management
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Next-generation HR platform engineered for <span className="text-white font-bold">Eman Bakeries Group</span>. <br className="hidden md:block" />
            Powered by real-time analytics, AI compliance, and advanced automation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/login"
              onClick={() => uiSound?.click()}
              onMouseEnter={() => uiSound?.hover()}
              className="group px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-[2rem] text-lg font-black transition-all shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center gap-3 active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative">Access Workspace</span>
              <Zap className="w-6 h-6 fill-white relative" />
            </Link>
            <div className="flex items-center gap-4 text-gray-500 font-bold group hover:text-gray-300 transition-colors">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> AES-256 Encryption
            </div>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-3 gap-8 mt-24 max-w-3xl mx-auto">
            {[
              { label: 'Active Users', value: '150+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Modules', value: '5' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Feature Cards - Dark Glassmorphism */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-6">
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Excellence</span>
              </h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                From Saudi Labor Law compliance to WPS automation, every feature designed for operational perfection.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg shadow-blue-500/50"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Digital Profiles', desc: 'Complete employee dossiers with biometrics, documents, and real-time status tracking.', icon: <Users className="w-8 h-8" /> },
              { title: 'Smart Compliance', desc: 'AI-powered alerts for Iqama, passport, and visa expirations with auto-notifications.', icon: <ShieldAlert className="w-8 h-8" /> },
              { title: 'WPS Integration', desc: 'One-click salary file generation for Mudad and Saudi banking systems.', icon: <CreditCard className="w-8 h-8" /> }
            ].map((card, i) => (
              <div
                key={i}
                onMouseEnter={() => uiSound?.hover()}
                className="group bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:-translate-y-2 transition-all duration-500 cursor-default relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-500 relative z-10">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10">{card.title}</h3>
                <p className="text-lg text-gray-400 font-medium leading-relaxed relative z-10">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Minimal Dark */}
      <footer className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
            <span className="text-gray-400 font-bold text-2xl">E</span>
          </div>
          <p className="text-gray-500 font-medium text-sm mb-4">© 2024 Eman Bakery 360. Enterprise System.</p>
          <div className="flex gap-8">
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer">Security</span>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
