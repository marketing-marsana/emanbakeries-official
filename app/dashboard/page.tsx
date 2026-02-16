'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/navigation/AppLayout';
import { TopNav } from '../components/navigation/TopNav';
import {
    Users,
    Clock,
    CalendarDays,
    AlertTriangle,
    PartyPopper,
    ChevronRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeLeaves: 0,
        pendingLeaves: 0,
        attendanceRate: 98, // Placeholder for attendance if not in DB
        complianceAlerts: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Get total employees
            const { count: empCount } = await supabase
                .from('employees')
                .select('*', { count: 'exact', head: true });

            // 2. Get pending leaves
            const { count: pendingCount } = await supabase
                .from('leaves')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Pending');

            // 3. Get active leaves (approved and currently within date range)
            const today = new Date().toISOString().split('T')[0];
            const { count: activeCount } = await supabase
                .from('leaves')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Approved')
                .lte('start_date', today)
                .gte('end_date', today);

            // 4. Fetch recent activities (e.g., last 5 leave requests)
            const { data: recentLeaves } = await supabase
                .from('leaves')
                .select(`
                    *,
                    employees (first_name, last_name, full_name_en)
                `)
                .order('created_at', { ascending: false })
                .limit(4);

            setStats({
                totalEmployees: empCount || 0,
                activeLeaves: activeCount || 0,
                pendingLeaves: pendingCount || 0,
                attendanceRate: empCount ? Math.round(((empCount - (activeCount || 0)) / empCount) * 100) : 100,
                complianceAlerts: 0 // Logic for compliance can be added later
            });

            if (recentLeaves) {
                setRecentActivity(recentLeaves.map(leave => ({
                    id: leave.id,
                    title: `${leave.employees?.full_name_en || 'Staff'} submitted ${leave.leave_type} leave`,
                    detail: `Status: ${leave.status}`,
                    time: format(new Date(leave.created_at), 'MMM d, h:mm a'),
                    type: leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'error' : 'warning'
                })));
            }

            // Mock events for now as we don't have a birthdays table specifically, 
            // but we could use employee DOB in future.
            setUpcomingEvents([
                { name: 'Emmen Marah', type: 'Birthday', date: '23-10-2026', initials: 'EM' },
                { name: 'Emmen Maras', type: 'Anniversary', date: '16-12-2026', initials: 'EM' }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <AppLayout>
            <TopNav />

            {loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                        {/* Card 1: Total Employees */}
                        <motion.div variants={itemVariants} className="group relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-white/5 shadow-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-500">
                            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-xl rounded-2xl"></div>
                            <div className="relative h-full flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-base font-normal text-amber-200/80">Total Employees</h3>
                                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                        <Users className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-light tracking-tighter text-white">{stats.totalEmployees}</span>
                                    </div>
                                    <p className="text-base text-zinc-500 mt-2 font-light">Active Staff</p>
                                </div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
                            </div>
                        </motion.div>

                        {/* Card 2: Attendance */}
                        <motion.div variants={itemVariants} className="group relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-white/5 shadow-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-500">
                            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-xl rounded-2xl"></div>
                            <div className="relative h-full flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-base font-normal text-orange-200/80">Attendance Rate</h3>
                                    <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                        <Clock className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-4xl font-light tracking-tighter text-white">{stats.attendanceRate}%</span>
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)] transition-all duration-1000"
                                                style={{ width: `${stats.attendanceRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-3 font-light">
                                        {stats.totalEmployees - stats.activeLeaves} Present Today
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: Pending Requests */}
                        <motion.div variants={itemVariants} className="group relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-white/5 shadow-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-500">
                            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-xl rounded-2xl"></div>
                            <div className="relative h-full flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-base font-normal text-emerald-200/80">Pending Requests</h3>
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <CalendarDays className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-4xl font-light tracking-tighter text-white">{stats.pendingLeaves}</span>
                                    <p className="text-base text-zinc-500 mt-2 font-light">Awaiting Approval</p>
                                </div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
                            </div>
                        </motion.div>

                        {/* Card 4: Compliance */}
                        <motion.div variants={itemVariants} className="group relative rounded-2xl p-px bg-gradient-to-b from-rose-500/30 to-white/5 shadow-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-500">
                            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-xl rounded-2xl"></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
                            <div className="relative h-full flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-base font-normal text-rose-200/80">Security Protocol</h3>
                                    <div className={`p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)] ${stats.complianceAlerts > 0 ? 'animate-pulse' : ''}`}>
                                        <ShieldCheck className={`w-5 h-5 ${stats.complianceAlerts > 0 ? 'text-rose-500' : 'text-zinc-500'}`} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <span className={`text-4xl font-light tracking-tighter ${stats.complianceAlerts > 0 ? 'text-rose-500' : 'text-white'}`}>
                                        {stats.complianceAlerts}
                                    </span>
                                    <p className="text-base text-zinc-500 mt-2 font-light">Active Alerts</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Lower Sections Combined */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Recent Activity Section */}
                        <div className="xl:col-span-2 relative rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-zinc-100">Live Activity Stream</h2>
                                <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium">
                                    Full Log <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto custom-scrollbar">
                                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full shadow-[0_0_8px] ${activity.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/80' :
                                                    activity.type === 'error' ? 'bg-rose-500 shadow-rose-500/80' :
                                                        'bg-amber-500 shadow-amber-500/80'
                                                }`}></div>
                                            <div>
                                                <p className="text-base text-zinc-200 group-hover:text-white transition-colors font-medium">{activity.title}</p>
                                                <p className="text-sm text-zinc-500 mt-1 font-light">{activity.detail}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-zinc-500 font-mono mt-2 sm:mt-0 whitespace-nowrap opacity-60">[{activity.time}]</span>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-zinc-600 font-light">
                                        No recent activities detected in the control stream.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Events Panel */}
                        <div className="relative rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
                                <h2 className="text-lg font-medium text-amber-100 flex items-center gap-2">
                                    Cultural Events <PartyPopper size={18} className="text-amber-500" />
                                </h2>
                                <p className="text-sm text-zinc-400 mt-1">Birthdays & Anniversaries</p>
                            </div>

                            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                {upcomingEvents.map((event, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all duration-500 rotate-3 group-hover:rotate-0">
                                                <span className="text-sm font-bold tracking-tighter">{event.initials}</span>
                                            </div>
                                            <div>
                                                <p className="text-base text-zinc-200 font-semibold tracking-tight">{event.name}</p>
                                                <p className="text-xs text-zinc-500 uppercase tracking-widest">{event.type}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-zinc-400 group-hover:text-amber-400 transition-colors">
                                            {event.date}
                                        </div>
                                    </div>
                                ))}

                                {/* Illustration Area */}
                                <div className="flex-1 flex items-center justify-center pt-10 opacity-10">
                                    <TrendingUp size={120} className="text-zinc-100" strokeWidth={0.5} />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-zinc-950/30">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.2em]">Operational Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-xs text-emerald-500 font-bold uppercase">Optimal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AppLayout>
    );
}
