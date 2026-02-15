'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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

  // IF LOGGED OUT: SHOW PREMIUM MARKETING LANDING PAGE
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-600 selection:text-white overflow-hidden font-sans">
      {/* Nav */}
      <nav className="fixed w-full top-0 h-24 bg-white/80 backdrop-blur-md z-[100] border-b border-slate-100 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Eman Bakery <span className="text-indigo-600">360</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Platform</a>
            <a href="#compliance" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Compliance</a>
            <Link href="/login" className="px-8 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/10 active:scale-95 flex items-center gap-2">
              Staff Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            className="lg:hidden p-3 bg-slate-100 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[90] lg:hidden animate-fadeIn">
          <div className="flex flex-col items-center justify-center h-full gap-8 p-6 text-center">
            <Link href="/login" className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-xl font-bold shadow-2xl">Login to Portal</Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl aspect-square bg-[#EEF2FF] rounded-full blur-[120px] -z-10 opacity-60"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-extra-bold uppercase tracking-[0.2em] mb-8 animate-bounce">
            <Star className="w-3 h-3 fill-indigo-600" /> New Era of HR
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9] max-w-5xl mx-auto">
            Elevate Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 underline decoration-indigo-600/30">Employee</span> Experience.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            The definitive Next-Gen HR Operating System tailored for <br className="hidden md:block" /> **Eman Bakeries Group**. Seamless, compliant, and powerful.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="px-12 py-6 bg-indigo-600 hover:bg-slate-900 text-white rounded-[2rem] text-lg font-black transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95 group">
              Access Staff Portal <Zap className="w-6 h-6 fill-white group-hover:fill-indigo-400 transition-colors" />
            </Link>
            <div className="flex items-center gap-4 text-slate-400 font-bold group hover:text-slate-900 transition-colors">
              <ShieldCheck className="w-6 h-6 text-emerald-500" /> Professional Grade Encryption
            </div>
          </div>
        </div>
      </section>

      {/* Platform Feature Cards */}
      <section id="features" className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">Built for Modern Bakeries.</h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">From payroll automation to Saudi Labor Law compliance, everything is integrated into one high-performance interface.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-1 bg-indigo-600 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Digital Dossiers', desc: 'Every employee profile reimagined with advanced glassmorphic design and complete records.', icon: <Users className="w-8 h-8" /> },
              { title: 'AI Compliance', desc: 'Predictive alerts for Iqama, Passport, and Visa expirations before they become critical.', icon: <ShieldAlert className="w-8 h-8" /> },
              { title: 'WPS Payroll', desc: 'Automated salary files ready for Mudad and Saudi banking portals in a single click.', icon: <CreditCard className="w-8 h-8" /> }
            ].map((card, i) => (
              <div key={i} className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-4 transition-all duration-500 cursor-default">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{card.title}</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-8">
            <span className="text-slate-400 font-bold text-2xl">E</span>
          </div>
          <p className="text-slate-400 font-medium text-sm mb-4">© 2024 Eman Bakery 360. All privileges reserved.</p>
          <div className="flex gap-8">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Privacy</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
