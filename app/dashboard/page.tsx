'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/navigation/AppLayout';
import { TopNav } from '../components/navigation/TopNav';
import {
    Users,
    Clock,
    CalendarDays,
    FileText,
    Download,
    MoreVertical,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        jobApplicants: 0,
        presentToday: 0,
        onLeave: 0,
        employeeGrowth: '+4%',
        applicantGrowth: '+12%',
        attendanceChange: '-2%'
    });
    const [recentLeaves, setRecentLeaves] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Get total employees
            const { count: empCount } = await supabase
                .from('employees')
                .select('*', { count: 'exact', head: true });

            // Get active leaves
            const today = new Date().toISOString().split('T')[0];
            const { count: activeCount } = await supabase
                .from('leaves')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Approved')
                .lte('start_date', today)
                .gte('end_date', today);

            // Get recent leave requests
            const { data: leaves } = await supabase
                .from('leaves')
                .select(`
                    *,
                    employees (first_name, last_name, full_name_en, position)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalEmployees: empCount || 0,
                jobApplicants: 0, // Placeholder
                presentToday: (empCount || 0) - (activeCount || 0),
                onLeave: activeCount || 0,
                employeeGrowth: '+4%',
                applicantGrowth: '+12%',
                attendanceChange: '-2%'
            });

            if (leaves) {
                setRecentLeaves(leaves);
            }

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
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <TopNav />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="pb-10"
            >
                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {/* Total Employees */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stats.employeeGrowth}</span>
                        </div>
                        <div className="z-10">
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stats.totalEmployees}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">Total Employees</p>
                        </div>
                        <Users className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 rotate-12" size={100} />
                    </motion.div>

                    {/* Job Applicants */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stats.applicantGrowth}</span>
                        </div>
                        <div className="z-10">
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stats.jobApplicants}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">Job Applicants</p>
                        </div>
                        <FileText className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 rotate-12" size={100} />
                    </motion.div>

                    {/* Present Today */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <Clock size={20} />
                            </div>
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">{stats.attendanceChange}</span>
                        </div>
                        <div className="z-10">
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stats.presentToday}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">Present Today</p>
                        </div>
                        <Clock className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 rotate-12" size={100} />
                    </motion.div>

                    {/* On Leave */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                <CalendarDays size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Active</span>
                        </div>
                        <div className="z-10">
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{String(stats.onLeave).padStart(2, '0')}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">On Leave</p>
                        </div>
                        <CalendarDays className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 rotate-12" size={100} />
                    </motion.div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Attendance Chart */}
                    <motion.div variants={itemVariants} className="xl:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-slate-200 text-white flex flex-col justify-between min-h-[420px]">
                        <div className="flex justify-between items-start z-20 relative">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-slate-700/50 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-slate-600">Yearly Report</span>
                                </div>
                                <h3 className="text-2xl font-semibold tracking-tight">Attendance Overview</h3>
                                <p className="text-slate-400 text-sm mt-1">Comparison with previous year</p>
                            </div>
                            <button className="bg-orange-500 hover:bg-orange-400 text-white p-2.5 rounded-xl transition-colors">
                                <Download size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-8 mt-8 mb-auto z-20 w-full md:w-3/4">
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Avg. Check-in</p>
                                <p className="text-xl font-bold mt-1 text-white">08:42 AM</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">On-Time %</p>
                                <p className="text-xl font-bold mt-1 text-orange-400">92%</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Overtime</p>
                                <p className="text-xl font-bold mt-1 text-white">420 Hrs</p>
                            </div>
                        </div>

                        {/* Chart SVG */}
                        <div className="absolute inset-x-0 bottom-0 h-56 w-full pointer-events-none">
                            <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 300">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.3 }}></stop>
                                        <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 0 }}></stop>
                                    </linearGradient>
                                </defs>
                                <line x1="0" y1="200" x2="1200" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5"></line>
                                <line x1="0" y1="100" x2="1200" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5"></line>
                                <path d="M0,250 C150,240 200,100 350,150 C500,200 550,50 700,80 C850,110 900,180 1050,140 C1150,110 1200,160 1200,160 V300 H0 Z" fill="url(#chartGradient)"></path>
                                <path d="M0,250 C150,240 200,100 350,150 C500,200 550,50 700,80 C850,110 900,180 1050,140 C1150,110 1200,160 1200,160" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round"></path>
                            </svg>
                        </div>
                    </motion.div>

                    {/* Employee Status Donut */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col h-full border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Employee Status</h3>
                            <button className="text-slate-400 hover:text-orange-500">
                                <MoreVertical size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center py-4">
                            <div className="relative w-48 h-48">
                                <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#f97316 0% 65%, #3b82f6 65% 85%, #cbd5e1 85% 100%)' }}></div>
                                <div className="absolute inset-0 m-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                    <span className="text-4xl font-bold text-slate-800 tracking-tight">{stats.totalEmployees}</span>
                                    <span className="text-xs text-slate-400 font-medium uppercase mt-1">Total Staff</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                    <span className="text-slate-600 font-medium">Permanent</span>
                                </div>
                                <span className="font-bold text-slate-800">65%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="text-slate-600 font-medium">Contract</span>
                                </div>
                                <span className="font-bold text-slate-800">20%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                                    <span className="text-slate-600 font-medium">Probation</span>
                                </div>
                                <span className="font-bold text-slate-800">15%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Leave Requests Table */}
                    <motion.div variants={itemVariants} className="xl:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Leave Requests</h3>
                                <p className="text-sm text-slate-400 mt-1">Manage employee time-off applications.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors">Filter</button>
                                <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">View All</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-slate-400 font-medium border-b border-slate-100">
                                        <th className="pb-4 pl-2 font-medium uppercase tracking-wider">Employee</th>
                                        <th className="pb-4 font-medium uppercase tracking-wider">Leave Type</th>
                                        <th className="pb-4 font-medium uppercase tracking-wider">Date</th>
                                        <th className="pb-4 font-medium uppercase tracking-wider">Duration</th>
                                        <th className="pb-4 font-medium uppercase tracking-wider">Status</th>
                                        <th className="pb-4 pr-2 font-medium uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentLeaves.length > 0 ? recentLeaves.map((leave, i) => (
                                        <tr key={leave.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                                                        {leave.employees?.first_name?.[0]}{leave.employees?.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{leave.employees?.full_name_en || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-400">{leave.employees?.position || 'Staff'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-600 font-medium">{leave.leave_type}</td>
                                            <td className="py-4 text-slate-500">
                                                {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 text-slate-500">
                                                {Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-100 text-green-600' :
                                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                            'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-2 text-right">
                                                <button className="text-slate-400 hover:text-slate-800">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400">
                                                No leave requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </AppLayout>
    );
}
