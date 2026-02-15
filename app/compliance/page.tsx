'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { navItems } from '@/app/components/enhanced/navConfig';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, FileText, Globe } from 'lucide-react';

interface ComplianceAlert {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'Critical' | 'High' | 'Medium' | 'Low';
    category: 'Iqama' | 'Passport' | 'GOSI' | 'Financial' | 'Discrepancy' | 'Other';
    title: string;
    description: string;
    dueDate?: string;
    status: 'Open' | 'Resolved';
}

export default function CompliancePage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);

    // Stats
    const [stats, setStats] = useState({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        byCategory: {
            Iqama: 0,
            Passport: 0,
            GOSI: 0,
            Financial: 0,
            Discrepancy: 0,
            Other: 0
        }
    });

    useEffect(() => {
        fetchComplianceData();
    }, []);

    const fetchComplianceData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Active Employees
            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('id, full_name_en, nationality, position, created_at')
                .eq('status', 'Active');

            if (empError) throw empError;

            // 2. Fetch Related Data
            const empIds = employees.map(e => e.id);

            const { data: compliance, error: compError } = await supabase
                .from('employee_compliance')
                .select('*')
                .in('employee_id', empIds);

            const { data: financials, error: finError } = await supabase
                .from('employee_financials')
                .select('*')
                .in('employee_id', empIds);

            const { data: snapshots, error: snapError } = await supabase
                .from('portal_data_snapshots')
                .select('employee_id, portal_source')
                .in('employee_id', empIds);

            if (compError || finError || snapError) {
                console.error('Error fetching details', { compError, finError, snapError });
            }

            // 3. Generate Alerts
            const generatedAlerts: ComplianceAlert[] = [];
            const today = new Date();
            const warningWindow30 = new Date(); warningWindow30.setDate(today.getDate() + 30);
            const warningWindow60 = new Date(); warningWindow60.setDate(today.getDate() + 60);

            employees.forEach(emp => {
                const empComp = compliance?.find(c => c.employee_id === emp.id);
                const empFin = financials?.find(f => f.employee_id === emp.id);

                // Determine Identity Type
                const isSaudi = emp.nationality?.toLowerCase().includes('saudi') || emp.nationality?.toLowerCase() === 'ksa';

                // --- CHECK 1: Discrepancies (Missing Sources) ---
                const sources = snapshots?.filter(s => s.employee_id === emp.id).map(s => s.portal_source) || [];

                if (isSaudi) {
                    // Saudi: Must have GOSI. Muqeem optional (usually none).
                    if (!sources.includes('GOSI')) {
                        generatedAlerts.push({
                            id: `disc-gosi-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'High',
                            category: 'Discrepancy',
                            title: 'Missing GOSI Record',
                            description: 'Employee is Saudi but missing from GOSI snapshot.',
                            status: 'Open'
                        });
                    }
                } else {
                    // Expat: Must have MUQEEM and GOSI.
                    if (!sources.includes('MUQEEM')) {
                        generatedAlerts.push({
                            id: `disc-muqeem-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'Critical', // Critical for Expats
                            category: 'Discrepancy',
                            title: 'Missing Muqeem Record',
                            description: 'Expat employee missing from Muqeem. Compliance Risk!',
                            status: 'Open'
                        });
                    }
                    if (!sources.includes('GOSI')) {
                        generatedAlerts.push({
                            id: `disc-gosi-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'High',
                            category: 'Discrepancy',
                            title: 'Missing GOSI Record',
                            description: 'Expat employee missing from GOSI snapshot.',
                            status: 'Open'
                        });
                    }
                }

                // --- CHECK 2: Iqama Expiry (Expats Only) ---
                if (!isSaudi && empComp?.iqama_expiry_gregorian) {
                    const expiry = new Date(empComp.iqama_expiry_gregorian);
                    if (expiry < today) {
                        generatedAlerts.push({
                            id: `iqama-exp-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'Critical',
                            category: 'Iqama',
                            title: 'Iqama Expired',
                            description: `Iqama expired on ${empComp.iqama_expiry_gregorian}.`,
                            dueDate: empComp.iqama_expiry_gregorian,
                            status: 'Open'
                        });
                    } else if (expiry < warningWindow30) {
                        generatedAlerts.push({
                            id: `iqama-soon-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'High',
                            category: 'Iqama',
                            title: 'Iqama Expiring Soon',
                            description: `Iqama expires in <30 days (${empComp.iqama_expiry_gregorian}).`,
                            dueDate: empComp.iqama_expiry_gregorian,
                            status: 'Open'
                        });
                    }
                } else if (!isSaudi && !empComp?.iqama_expiry_gregorian) {
                    // Missing expiry date data for expat
                    generatedAlerts.push({
                        id: `iqama-missing-${emp.id}`,
                        employeeId: emp.id,
                        employeeName: emp.full_name_en,
                        type: 'High',
                        category: 'Iqama',
                        title: 'Missing Iqama Detail',
                        description: 'Iqama expiry date is missing in system.',
                        status: 'Open'
                    });
                }

                // --- CHECK 3: Passport Expiry (Expats Only) ---
                if (!isSaudi && empComp?.passport_expiry_date) {
                    const expiry = new Date(empComp.passport_expiry_date);
                    if (expiry < today) {
                        generatedAlerts.push({
                            id: `pass-exp-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'High',
                            category: 'Passport',
                            title: 'Passport Expired',
                            description: `Passport expired on ${empComp.passport_expiry_date}.`,
                            dueDate: empComp.passport_expiry_date,
                            status: 'Open'
                        });
                    } else if (expiry < warningWindow60) {
                        generatedAlerts.push({
                            id: `pass-soon-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'Medium',
                            category: 'Passport',
                            title: 'Passport Expiring Soon',
                            description: `Passport expires in <60 days (${empComp.passport_expiry_date}).`,
                            dueDate: empComp.passport_expiry_date,
                            status: 'Open'
                        });
                    }
                }

                // --- CHECK 4: Missing IBAN (All) ---
                if (!empFin?.iban || empFin.iban.trim() === '') {
                    generatedAlerts.push({
                        id: `iban-missing-${emp.id}`,
                        employeeId: emp.id,
                        employeeName: emp.full_name_en,
                        type: 'High',
                        category: 'Financial',
                        title: 'Missing IBAN',
                        description: 'Payroll cannot be processed via WPS/Mudad without IBAN.',
                        status: 'Open'
                    });
                }
            });

            setAlerts(generatedAlerts);

            // Calculate Stats
            const newStats = {
                critical: generatedAlerts.filter(a => a.type === 'Critical').length,
                high: generatedAlerts.filter(a => a.type === 'High').length,
                medium: generatedAlerts.filter(a => a.type === 'Medium').length,
                low: generatedAlerts.filter(a => a.type === 'Low').length,
                byCategory: {
                    Iqama: generatedAlerts.filter(a => a.category === 'Iqama').length,
                    Passport: generatedAlerts.filter(a => a.category === 'Passport').length,
                    GOSI: generatedAlerts.filter(a => a.category === 'GOSI').length,
                    Financial: generatedAlerts.filter(a => a.category === 'Financial').length,
                    Discrepancy: generatedAlerts.filter(a => a.category === 'Discrepancy').length,
                    Other: generatedAlerts.filter(a => a.category === 'Other').length
                }
            };
            setStats(newStats);

        } catch (err) {
            console.error('Error in compliance check:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityStyles = (type: string) => {
        switch (type) {
            case 'Critical': return { border: 'border-red-500', badge: 'bg-red-100 text-red-800', text: 'text-red-600', icon: <AlertCircle className="w-5 h-5" /> };
            case 'High': return { border: 'border-orange-500', badge: 'bg-orange-100 text-orange-800', text: 'text-orange-600', icon: <AlertTriangle className="w-5 h-5" /> };
            case 'Medium': return { border: 'border-yellow-500', badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-600', icon: <Clock className="w-5 h-5" /> };
            default: return { border: 'border-blue-500', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-600', icon: <FileText className="w-5 h-5" /> };
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Navigation - Same structure */}
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
                            const isActive = item.href === '/compliance';
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

                <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">Compliance Monitoring</h2>
                            <p className="text-gray-600">Real-time verification against GOSI, Muqeem, and Payroll records.</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                    <p className="text-sm font-medium text-gray-600">Critical</p>
                                </div>
                                <p className="text-3xl font-bold text-red-600">{loading ? '...' : stats.critical}</p>
                                <p className="text-xs text-gray-500 mt-2">Immediate action needed</p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    <p className="text-sm font-medium text-gray-600">High</p>
                                </div>
                                <p className="text-3xl font-bold text-orange-600">{loading ? '...' : stats.high}</p>
                                <p className="text-xs text-gray-500 mt-2">Needs attention soon</p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-6 h-6 text-yellow-500" />
                                    <p className="text-sm font-medium text-gray-600">Medium</p>
                                </div>
                                <p className="text-3xl font-bold text-yellow-600">{loading ? '...' : stats.medium}</p>
                                <p className="text-xs text-gray-500 mt-2">Can be scheduled</p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-6 h-6 text-blue-500" />
                                    <p className="text-sm font-medium text-gray-600">Low</p>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">{loading ? '...' : stats.low}</p>
                                <p className="text-xs text-gray-500 mt-2">Monitoring only</p>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Alerts Feed */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-gray-900">Active Alerts</h3>
                                    <span className="text-sm text-gray-500">{alerts.length} total issues</span>
                                </div>

                                {loading ? (
                                    <div className="p-12 text-center text-gray-500">Checking compliance...</div>
                                ) : alerts.length === 0 ? (
                                    <div className="p-12 text-center bg-green-50 rounded-lg border border-green-100">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                        <h3 className="text-green-800 font-bold">All Clear!</h3>
                                        <p className="text-green-600">No compliance issues detected across systems.</p>
                                    </div>
                                ) : (
                                    alerts.map((alert, idx) => {
                                        const styles = getSeverityStyles(alert.type);
                                        return (
                                            <div
                                                key={idx}
                                                className={`bg-white rounded-lg border-l-4 ${styles.border} p-5 shadow-sm hover:shadow-md transition-all duration-300`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`${styles.text} font-bold flex items-center gap-1`}>
                                                                {styles.icon} {alert.type}
                                                            </span>
                                                            <span className={`text-xs font-semibold px-2 py-1 ${styles.badge} rounded`}>
                                                                {alert.category}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {alert.description} <br />
                                                    <span className="font-medium text-gray-800">Employee: {alert.employeeName}</span>
                                                </p>
                                                {alert.dueDate && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Due: {alert.dueDate}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Stats Sidebar */}
                            <div className="space-y-6">
                                {/* Categories */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">Issues by Category</h4>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Discrepancies', count: stats.byCategory.Discrepancy, color: 'bg-purple-600' },
                                            { label: 'Iqama / ID', count: stats.byCategory.Iqama, color: 'bg-indigo-600' },
                                            { label: 'Passport', count: stats.byCategory.Passport, color: 'bg-blue-600' },
                                            { label: 'Financial / IBAN', count: stats.byCategory.Financial, color: 'bg-green-600' },
                                            { label: 'GOSI', count: stats.byCategory.GOSI, color: 'bg-orange-600' },
                                        ].map(cat => (
                                            <div key={cat.label}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-600">{cat.label}</span>
                                                    <span className="font-semibold">{cat.count}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full ${cat.color}`} style={{ width: `${(cat.count / Math.max(1, alerts.length)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
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
