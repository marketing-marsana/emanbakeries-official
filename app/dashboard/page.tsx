'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Users,
    CreditCard,
    ShieldAlert,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { AppLayout } from '@/app/components/navigation/AppLayout';
import { motion } from 'framer-motion';

// Sample stats formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalPayroll: 0,
        complianceAlerts: 3,
        attendanceRate: 98
    });

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const { data } = await supabase.from('employees').select('salary');
            if (data) {
                const totalPayroll = data.reduce((sum, e) => sum + (e.salary || 0), 0);
                setStats(prev => ({
                    ...prev,
                    totalEmployees: data.length,
                    totalPayroll
                }));
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const kpiCards = [
        {
            label: 'Total Workforce',
            value: stats.totalEmployees,
            sub: 'Active Staff',
            icon: <Users className="text-blue-600" />,
            color: 'bg-blue-50',
            trend: '+2 this month'
        },
        {
            label: 'Monthly Payroll',
            value: formatCurrency(stats.totalPayroll),
            sub: 'Total Liability',
            icon: <CreditCard className="text-emerald-600" />,
            color: 'bg-emerald-50',
            trend: 'Stable'
        },
        {
            label: 'Compliance',
            value: stats.complianceAlerts,
            sub: 'Pending Actions',
            icon: <ShieldAlert className="text-rose-600" />,
            color: 'bg-rose-50',
            trend: 'Critical'
        },
        {
            label: 'Attendance',
            value: `${stats.attendanceRate}%`,
            sub: 'Today Average',
            icon: <Calendar className="text-amber-600" />,
            color: 'bg-amber-50',
            trend: 'Normal'
        },
    ];

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
                        <p className="text-slate-500 font-medium">Real-time HR analytics for Eman Bakery</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                            Export PDF
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
                            New Report
                        </button>
                    </div>
                </div>

                {/* KPI Grid: 1 col on mobile, 2 col sm, 4 col lg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {kpiCards.map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all group cursor-default"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    {card.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${card.trend.includes('Critical') ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {card.trend}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 leading-none">{loading ? '...' : card.value}</h3>
                            <p className="text-xs font-bold text-slate-500">{card.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid: 1 col on mobile, 3 col desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed / Main Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900">Recent Employee Onboarding</h2>
                                <button className="text-xs font-bold text-indigo-600 hover:underline">View All Staff</button>
                            </div>

                            {/* Mobile-friendly list that becomes cards or stays as clean rows */}
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">New Staff Member #{i + 1}</p>
                                            <p className="text-xs text-slate-500 font-medium tracking-tight">Department: Production Line · Joined Today</p>
                                        </div>
                                        <ArrowUpRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={20} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Spotlight Card */}
                        <div className="md:hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-4">Mobile Quick Action</span>
                                <h3 className="text-2xl font-black mb-2 leading-none">Complete Payroll Confirmation</h3>
                                <p className="text-indigo-100 text-sm font-medium mb-6 opacity-80">Cycle Feb 2024 is ready for final verification according to Mudad specifications.</p>
                                <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">Proceed to Mudad</button>
                            </div>
                            <TrendingUp className="absolute bottom-[-10%] right-[-10%] w-40 h-40 text-white/10 -rotate-12" />
                        </div>
                    </div>

                    {/* Right Rails / Sidebar info */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20">
                            <h2 className="text-lg font-black mb-6">Compliance Status</h2>
                            <div className="space-y-6">
                                {['Iqama Renewal', 'Exit/Re-entry', 'GOSI Settlement'].map((task, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                            <span className="text-slate-400">{task}</span>
                                            <span className="text-indigo-400">{85 - (i * 15)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${85 - (i * 15)}%` }}
                                                transition={{ duration: 1, delay: i * 0.2 }}
                                                className="h-full bg-indigo-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-4 border border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors">Generate Compliance Audit</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6">Upcoming Holidays</h2>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">Next official gazetted holiday is **National Day** in 12 days.</p>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-400">
                                        U{i}
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center font-black text-[10px] text-white">
                                    +12
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
