'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { navItems } from '@/app/components/enhanced/navConfig';

// Helper for formatting currency
const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
    }
    if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'k';
    }
    return amount.toString();
};

export default function DashboardPage() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Real data state
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        saudiEmployees: 0,
        expatEmployees: 0,
        totalPayroll: 0,
        activeAlerts: 0,
        offboardingCount: 0
    });

    const [recentEmployees, setRecentEmployees] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch employees to calculate stats
            const { data: employees, error } = await supabase
                .from('employees')
                .select('*');

            if (error) throw error;

            if (employees) {
                const total = employees.length;
                const saudis = employees.filter(e => e.nationality?.toLowerCase().includes('saudi') || e.nationality?.toLowerCase() === 'ksa').length;
                const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);

                setStats({
                    totalEmployees: total,
                    saudiEmployees: saudis,
                    expatEmployees: total - saudis,
                    totalPayroll: totalSalary,
                    activeAlerts: 5, // Placeholder until alerts table is ready
                    offboardingCount: employees.filter(e => e.status === 'Offboarding').length
                });

                // Get 5 most recent employees for activity feed
                // Sort by created_at desc if available, or just take last 5
                setRecentEmployees(employees.slice(0, 5));
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-40">
                <div className="flex items-center justify-between h-16 px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            Eman Bakery <span className="text-indigo-600 font-extrabold ml-1">360</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                ></path>
                            </svg>
                            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            EN
                        </button>
                        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white text-sm font-bold">AR</span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Sidebar - Premium Glassmorphism */}
                <aside
                    className={`bg-slate-900 text-slate-300 min-h-screen fixed left-0 top-16 shadow-2xl z-30 transition-all duration-300 border-r border-slate-700/50 backdrop-blur-xl ${sidebarCollapsed ? 'w-20' : 'w-72'
                        }`}
                >
                    <div className={`p-6 mb-2 border-b border-slate-700/50 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-none">Eman Bakery</p>
                                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Workspace</p>
                            </div>
                        </div>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = item.href === '/dashboard';
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive
                                        ? 'bg-slate-800 text-white shadow-lg shadow-indigo-500/20 border-l-4 border-indigo-500 pl-3'
                                        : 'hover:bg-slate-800 hover:text-white hover:pl-5'
                                        }`}
                                >
                                    <span className={`transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && <span className="font-medium tracking-wide">{item.name}</span>}
                                </a>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
                    <div className="p-8">
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">Good Morning, Admin</h2>
                            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        {/* KPI Cards */}
                        {/* Offboarding Alert */}
                        {stats.offboardingCount > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-100 p-3 rounded-full text-red-600">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-800">Action Required: Offboarding In Progress</h3>
                                        <p className="text-red-700">
                                            {stats.offboardingCount} employee(s) are pending final termination (Muqeem removal).
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/employees')}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-md flex items-center gap-2"
                                >
                                    View Pending Actions
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Employees */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Total Employees</p>
                                        {loading ? (
                                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                        ) : (
                                            <h3 className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</h3>
                                        )}
                                        <p className="text-sm text-green-600 mt-2">Active Workforce</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Saudi Employees */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Saudi Employees</p>
                                        {loading ? (
                                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                        ) : (
                                            <h3 className="text-3xl font-bold text-gray-900">{stats.saudiEmployees}</h3>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">{stats.totalEmployees > 0 ? Math.round((stats.saudiEmployees / stats.totalEmployees) * 100) : 0}% of workforce</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expat Employees */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Expat Employees</p>
                                        {loading ? (
                                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                        ) : (
                                            <h3 className="text-3xl font-bold text-gray-900">{stats.expatEmployees}</h3>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">{stats.totalEmployees > 0 ? Math.round((stats.expatEmployees / stats.totalEmployees) * 100) : 0}% of workforce</p>
                                    </div>
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Total Payroll */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Total Monthly Payroll</p>
                                        {loading ? (
                                            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                                        ) : (
                                            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPayroll)}</h3>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">SAR per month</p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-2">
                                {/* Recent Activity Feed using real data */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Employee Additions</h3>
                                    <div className="space-y-4">
                                        {loading ? (
                                            <p className="text-gray-500">Loading activity...</p>
                                        ) : recentEmployees.length === 0 ? (
                                            <p className="text-gray-500">No recent activity found.</p>
                                        ) : (
                                            recentEmployees.map((emp) => (
                                                <div key={emp.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg">👤</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">New employee added: {emp.first_name} {emp.last_name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{emp.position} - {emp.department}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
