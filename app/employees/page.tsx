'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { navItems } from '@/app/components/enhanced/navConfig';

// Define the Employee interface matching your DB structure
interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
    department: string;
    status: string;
    iqama_number: string;
    iqama_expiry: string;
    salary: number;
    nationality: string;
    joining_date: string;
    email: string;
    phone: string;
    iban: string;
    contract_end: string;
    identity_number: string;
    arabic_name: string;
    full_name_en: string;
    // is_outside_kingdom?: boolean; // Now derived from leaves
    leaves?: any[]; // To track active status
}

interface PortalSnapshot {
    portal_source: 'GOSI' | 'MUDAD' | 'MUQEEM' | 'QIWA';
    raw_data: any;
    sync_date: string;
}

export default function EmployeesPage() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);

    // State for real data
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [statusFilter, setStatusFilter] = useState('Active');

    const [snapshots, setSnapshots] = useState<Record<string, any>>({});
    const [activeTab, setActiveTab] = useState('overview');
    const [snapshotLoading, setSnapshotLoading] = useState(false);

    // Fetch data from Supabase on mount
    useEffect(() => {
        fetchEmployees();
    }, [statusFilter]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('employees')
                .select('*, salary, arabic_name, identity_number, full_name_en, leaves(start_date, end_date, status, exit_reentry_visa)')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'All') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching employees:', error);
            } else {
                setEmployees(data || []);
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSnapshots = async (employeeId: string) => {
        setSnapshotLoading(true);
        setSnapshots({});
        try {
            const { data, error } = await supabase
                .from('portal_data_snapshots')
                .select('*')
                .eq('employee_id', employeeId);

            if (error) {
                console.error('Error fetching snapshots:', error);
            } else {
                // Group by source
                const grouped = (data || []).reduce((acc: any, curr: PortalSnapshot) => {
                    acc[curr.portal_source] = curr.raw_data;
                    return acc;
                }, {});
                setSnapshots(grouped);
            }
        } catch (err) {
            console.error('Error fetching snapshots:', err);
        } finally {
            setSnapshotLoading(false);
        }
    };


    // Helper to determine status color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'on leave': return 'bg-yellow-100 text-yellow-800';
            case 'terminated': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper for initials
    const getInitials = (first: string, last: string) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
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
                            const isActive = item.href === '/employees';
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
                <main
                    className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}
                >
                    <div className="p-8">
                        {/* Page Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Employees</h2>
                                    <p className="text-gray-600 mt-1">Manage and monitor your team</p>
                                </div>
                                <button
                                    onClick={() => router.push('/employees/workflow/add')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                                >
                                    + Add Employee / Onboard
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                {/* Status Filter Tabs */}
                                <div className="flex p-1 bg-gray-100 rounded-lg overflow-x-auto no-scrollbar">
                                    {['Active', 'Offboarding', 'Terminated', 'All'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setStatusFilter(tab)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${statusFilter === tab
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* View Toggle */}
                                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        title="List View"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        title="Grid View"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Dropdowns & Search */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full">
                                    <option>Department: All</option>
                                    <option>Operations</option>
                                    <option>Production</option>
                                    <option>Quality Assurance</option>
                                </select>
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full">
                                    <option>Nationality: All</option>
                                    <option>Saudi Arabia</option>
                                    <option>Egypt</option>
                                    <option>Pakistan</option>
                                    <option>India</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full"
                                />
                            </div>
                        </div>

                        {/* Employees Content (Grid or List) */}
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                Loading employees...
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                No employees found. Click "Add Employee" to create one.
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* GRID VIEW (KANBAN CARDS) */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {employees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setActiveTab('overview');
                                            setProfileModalOpen(true);
                                            fetchSnapshots(employee.id);
                                        }}
                                        className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 hover:rotate-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden perspective-1000"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md border ${employee.status === 'Active' ? 'bg-green-50/90 text-green-700 border-green-200' :
                                                employee.status === 'Terminated' ? 'bg-red-50/90 text-red-700 border-red-200' : 'bg-gray-50/90 text-gray-700 border-gray-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full shadow-inner ${employee.status === 'Active' ? 'bg-green-500' :
                                                    employee.status === 'Terminated' ? 'bg-red-500' : 'bg-gray-500'
                                                    }`}></span>
                                                {employee.status || 'Active'}
                                            </span>
                                        </div>

                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-50">
                                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-indigo-600">
                                                        {getInitials(employee.first_name, employee.last_name)}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={employee.full_name_en || `${employee.first_name} ${employee.last_name}`}>
                                                    {employee.full_name_en || `${employee.first_name} ${employee.last_name}`}
                                                </h3>
                                                {employee.arabic_name && (
                                                    <p className="text-sm text-gray-500 font-arabic mt-1">{employee.arabic_name}</p>
                                                )}
                                                <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-3">
                                                    {employee.position}
                                                </p>
                                            </div>

                                            {/* Details */}
                                            <div className="py-4 space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Department</span>
                                                    <span className="font-medium text-gray-900">{employee.department || '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Iqama / ID</span>
                                                    <span className="font-medium text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded">{employee.identity_number || employee.iqama_number || '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Salary</span>
                                                    <span className="font-bold text-gray-900">SAR {employee.salary?.toLocaleString() || '0'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 group-hover:bg-indigo-50/30 transition-colors">
                                            {/* Travel Status Badge (Derived from Leaves) */}
                                            {(() => {
                                                const today = new Date();
                                                const isOutsideKSA = employee.leaves?.some((l: any) =>
                                                    l.status === 'Approved' &&
                                                    l.exit_reentry_visa &&
                                                    new Date(l.start_date) <= today &&
                                                    new Date(l.end_date) >= today
                                                );

                                                if (isOutsideKSA) {
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm bg-orange-100 text-orange-800 border border-orange-200">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                            Outside KSA
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm bg-blue-50 text-blue-700 border border-blue-100">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                                            Inside KSA
                                                        </span>
                                                    );
                                                }
                                            })()}

                                            <div />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* LIST VIEW (Legacy Table) */
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Position
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Iqama
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Salary
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {employees.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                onClick={() => {
                                                    setSelectedEmployee(employee);
                                                    setActiveTab('overview');
                                                    setProfileModalOpen(true);
                                                    fetchSnapshots(employee.id);
                                                }}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-bold text-indigo-600">
                                                                {getInitials(employee.first_name, employee.last_name)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {employee.full_name_en || `${employee.first_name} ${employee.last_name}`}
                                                            </p>
                                                            {employee.arabic_name && (
                                                                <p className="text-xs text-gray-500 font-arabic text-right mt-0.5">
                                                                    {employee.arabic_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{employee.position}</p>
                                                    <p className="text-xs text-gray-500">{employee.department}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                                                            employee.status
                                                        )}`}
                                                    >
                                                        {employee.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{employee.identity_number || employee.iqama_number || '-'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        SAR {employee.salary?.toLocaleString() || '0'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/employees/workflow/offboarding?id=${employee.id}`);
                                                        }}
                                                        className="text-red-400 hover:text-red-600 ml-2"
                                                        title="Terminate / Offboard"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}


                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">Showing {employees.length} employees</p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    ← Previous
                                </button>
                                <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium">1</button>
                                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div >

            {/* Employee Profile Modal */}
            {
                profileModalOpen && selectedEmployee && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setProfileModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Profile Header */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-indigo-600">
                                            {getInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {selectedEmployee.first_name} {selectedEmployee.last_name}
                                        </h2>
                                        <p className="text-indigo-100">
                                            {selectedEmployee.position} • {selectedEmployee.nationality || 'N/A'}
                                        </p>
                                        <p className="text-indigo-100 text-sm mt-1">
                                            Hired: {selectedEmployee.joining_date || 'N/A'} • Status: {selectedEmployee.status || 'Active'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            router.push(`/employees/workflow/offboarding?id=${selectedEmployee.id}`);
                                        }}
                                        className="text-white/80 hover:text-red-200 hover:bg-white/10 p-2 rounded-full transition-colors"
                                        title="Terminate / Offboard"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                    <button onClick={() => setProfileModalOpen(false)} className="text-white hover:text-indigo-100 p-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 bg-gray-50 flex overflow-x-auto">
                                {['overview', 'MUQEEM', 'QIWA', 'GOSI', 'MUDAD'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-6 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab
                                            ? 'border-indigo-600 text-indigo-600 bg-white'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab === 'overview' ? 'Overview' : `${tab} Data`}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {activeTab === 'overview' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Left Column */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Personal Info</h4>
                                            <div className="space-y-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">ID / Iqama</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.identity_number || selectedEmployee.iqama_number || '-'}</p>
                                                </div>
                                                {selectedEmployee.arabic_name && (
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase">Name (Arabic)</p>
                                                        <p className="font-medium text-gray-900 font-arabic">{selectedEmployee.arabic_name}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Iqama</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.iqama_number || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Email</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.email || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Phone</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.phone || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle Column */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Employment</h4>
                                            <div className="space-y-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Position</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.position}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Department</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.department}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Contract End</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.contract_end || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">Salary</p>
                                                    <p className="font-medium text-gray-900">SAR {selectedEmployee.salary?.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase">IBAN</p>
                                                    <p className="font-medium text-gray-900">{selectedEmployee.iban || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Snapshots Status</h4>
                                            <div className="space-y-3">
                                                {['MUQEEM', 'QIWA', 'GOSI', 'MUDAD'].map((source) => (
                                                    <div key={source} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                        <span className="text-sm font-medium text-gray-700">{source}</span>
                                                        {snapshots[source] ? (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Synced</span>
                                                        ) : (
                                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Missing</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-900">{activeTab} Digital Profile Data</h4>
                                            {snapshotLoading && <span className="text-sm text-gray-500 animate-pulse">Loading...</span>}
                                        </div>

                                        {snapshots[activeTab] ? (
                                            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
                                                    {Object.entries(snapshots[activeTab])
                                                        .filter(([key]) => key !== 'Outside The Kingdom')
                                                        .map(([key, value]) => (
                                                            <div key={key} className="bg-white p-4">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                                                    {key.replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="text-sm font-medium text-gray-900 break-words">
                                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value || '-')}
                                                                </p>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <p className="text-gray-500 mb-2">No data synced from {activeTab} yet.</p>
                                                <button className="text-indigo-600 font-medium hover:text-indigo-700">
                                                    Trigger Manual Sync
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => router.push(`/employees/workflow/offboarding?id=${selectedEmployee.id}`)}
                                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"></path></svg>
                                    Terminate / Offboard
                                </button>
                                <button
                                    onClick={() => setProfileModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Employee Modal - Wrapped in existing logic */}
            {
                addEmployeeModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setAddEmployeeModalOpen(false)}
                    >
                        <div className="bg-white rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">New Employee</h3>
                                <button onClick={() => setAddEmployeeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            {/* Simple form for now - functionality would be added next */}
                            <div className="p-6 space-y-4">
                                <p className="text-gray-500 text-sm">Form functionality would be implemented to INSERT into Supabase.</p>
                            </div>

                            <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => setAddEmployeeModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                                    Add Employee
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
