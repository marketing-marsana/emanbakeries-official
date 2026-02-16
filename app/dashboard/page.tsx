'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/navigation/AppLayout';
import { Users, Briefcase, Calendar, Clock, ArrowRight, Zap, TrendingUp, Activity, ShieldCheck, Globe } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function Dashboard() {
    // Component states for visual interest
    const [stats, setStats] = useState({
        totalEmployees: 48,
        activeLeaves: 5,
        upcomingAnniversaries: 3,
        systemEfficiency: '98.4%'
    });

    const metrics = [
        { label: 'Workforce', value: stats.totalEmployees, icon: <Users size={28} />, detail: 'Active Personal', type: 'chrome' },
        { label: 'Efficiency', value: stats.systemEfficiency, icon: <Zap size={28} />, detail: 'Operational Load', type: 'glass' },
        { label: 'Incidents', value: '02', icon: <ShieldCheck size={28} />, detail: 'Security Level', type: 'chrome' },
        { label: 'Global', value: '01', icon: <Globe size={28} />, detail: 'Network Nodes', type: 'glass' }
    ];

    const activities = [
        { title: 'Sector A14 Onboarding', time: '14:20:05', status: 'COMPLETE', sector: 'BAKERY HQ' },
        { title: 'System Security Protocol', time: '13:45:12', status: 'ACTIVE', sector: 'NETWORK' },
        { title: 'Leave Authorization IRQ-04', time: '11:12:00', status: 'PENDING', sector: 'S.V. DEPT' },
        { title: 'Sector B02 Deployment', time: '09:30:45', status: 'COMPLETE', sector: 'LOGISTICS' },
    ];

    return (
        <AppLayout>
            <div className="space-y-12 pb-20">
                {/* Immersive Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-[10px] font-black tracking-[0.6em] text-white/30 uppercase mb-4 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-white/20"></span> CommandCenter
                            <span className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] animate-pulse">Live</span>
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none text-glow-md">
                            METRIC <span className="text-white/20">MATRIX</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/20 leading-none mb-2">Sync Time</p>
                            <p className="text-white font-black text-xl tracking-tighter">15 FEB 2026</p>
                        </div>
                        <button className="chrome-panel px-10 py-5 rounded-[2rem] text-obsidian font-black text-sm tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-2xl active:scale-95 group">
                            GENERATE REPORT <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </header>

                {/* 3D Stat Grid - Inspired by the modular Moorgen panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 transform cursor-default group/grid">
                    {metrics.map((m, i) => (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative h-[320px] p-10 flex flex-col justify-between overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:z-20 ${m.type === 'chrome' ? 'chrome-panel rounded-[3rem]' : 'glass-panel rounded-[3rem]'
                                }`}
                        >
                            {/* Accent Gloss */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className={`p-4 rounded-2xl ${m.type === 'chrome' ? 'bg-obsidian text-white' : 'bg-white/10 text-white'}`}>
                                    {m.icon}
                                </div>
                                <Activity size={18} className={m.type === 'chrome' ? 'text-obsidian/20' : 'text-white/10'} />
                            </div>

                            <div className="relative z-10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-3 ${m.type === 'chrome' ? 'text-obsidian/40' : 'text-white/30'}`}>
                                    {m.label}
                                </p>
                                <p className={`text-6xl font-black tracking-tighter mb-1 ${m.type === 'chrome' ? 'text-obsidian' : 'text-white text-glow-sm'}`}>
                                    {m.value}
                                </p>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${m.type === 'chrome' ? 'text-obsidian/30' : 'text-white/20'}`}>
                                    {m.detail}
                                </p>
                            </div>

                            {/* Decorative 3D Groove Elements */}
                            <div className={`absolute bottom-6 right-6 w-12 h-1 ${m.type === 'chrome' ? 'bg-obsidian/10' : 'bg-white/10'} rounded-full`} />
                        </motion.div>
                    ))}
                </div>

                {/* Large Modular Panels Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
                    {/* Activity Feed - The Dark Obsidian "Hub" */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-12 xl:col-span-8 glass-panel rounded-[4rem] p-12 relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter mb-2">SYSTEM ACTIVITY</h3>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Real-time operational streams</p>
                            </div>
                            <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                <TrendingUp size={24} className="text-white/60" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activities.map((act, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="flex items-center justify-between p-7 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-crosshair group/item"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="text-[10px] font-mono text-white/40 tracking-wider">[{act.time}]</div>
                                        <div>
                                            <p className="font-black text-lg tracking-tight mb-1 group-hover/item:text-glow-sm transition-all">{act.title}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-heading">{act.sector}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest border ${act.status === 'COMPLETE'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                                        }`}>
                                        {act.status}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Side Info Panel - Metallic Accents */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-12 xl:col-span-4 space-y-8"
                    >
                        <div className="chrome-panel rounded-[4rem] p-12 flex flex-col justify-between min-h-[450px]">
                            <div>
                                <p className="text-[10px] font-black text-obsidian/30 uppercase tracking-[0.4em] mb-8">Quick Protocols</p>
                                <div className="space-y-4">
                                    {['System Restart', 'Security Audit', 'Manual Override'].map((text) => (
                                        <button key={text} className="w-full py-5 px-8 rounded-2xl bg-obsidian text-white font-black text-xs tracking-widest hover:scale-[1.03] active:scale-95 transition-all text-left flex items-center justify-between group">
                                            {text.toUpperCase()} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-10 mt-10 border-t border-black/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="h-1 bg-black/5 rounded-full mb-3">
                                            <div className="h-full w-3/4 bg-obsidian rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]"></div>
                                        </div>
                                        <p className="text-[10px] font-black text-obsidian/40 uppercase tracking-widest">Database Sync Progress</p>
                                    </div>
                                    <span className="font-black text-obsidian text-lg">75%</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel rounded-[4rem] p-12 flex items-center gap-8 group cursor-pointer hover:bg-white/[0.05] transition-all">
                            <div className="w-20 h-20 rounded-3xl bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center transition-transform group-hover:rotate-12">
                                <Clock size={32} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white tracking-tighter mb-1">Time Sheet</p>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] font-heading">Last Sync: 2m ago</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Global Transitions & Visual Interest */}
            <motion.div
                className="fixed bottom-10 right-10 w-4 h-4 rounded-full bg-white shadow-[0_0_30px_white] pointer-events-none opacity-40 z-50 animate-pulse"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ duration: 4, repeat: Infinity }}
            ></motion.div>
        </AppLayout>
    );
}
