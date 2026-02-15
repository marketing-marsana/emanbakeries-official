'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { navItems } from '@/app/components/enhanced/navConfig';

export default function LeavesPage() {
    const router = useRouter();

    // Layout State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Page State
    const [leaves, setLeaves] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        employee_id: '',
        leave_type: 'Annual',
        start_date: '',
        end_date: '',
        exit_reentry_visa: false,
        visa_duration_days: '',
        visa_expiry_date: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Employees for Dropdown
        const { data: empData } = await supabase
            .from('employees')
            .select('id, first_name, last_name, full_name_en')
            .order('first_name');

        if (empData) setEmployees(empData);

        // Fetch Leaves History
        const { data: leaveData, error } = await supabase
            .from('leaves')
            .select(`
                *,
                employee:employees(first_name, last_name, full_name_en, position)
            `)
            .order('created_at', { ascending: false });

        if (leaveData) setLeaves(leaveData);
        if (error) console.error('Error fetching leaves:', error);

        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            employee_id: formData.employee_id,
            leave_type: formData.leave_type,
            start_date: formData.start_date,
            end_date: formData.end_date,
            exit_reentry_visa: formData.exit_reentry_visa,
            visa_duration_days: formData.exit_reentry_visa ? parseInt(formData.visa_duration_days || '0') : null,
            visa_expiry_date: formData.exit_reentry_visa ? formData.visa_expiry_date : null,
            notes: formData.notes,
            status: 'Pending'
        };

        const { error } = await supabase.from('leaves').insert(payload);

        if (error) {
            alert('Error creating leave request: ' + error.message);
        } else {
            alert('Leave request submitted successfully!');
            setIsModalOpen(false);
            setFormData({
                employee_id: '',
                leave_type: 'Annual',
                start_date: '',
                end_date: '',
                exit_reentry_visa: false,
                visa_duration_days: '',
                visa_expiry_date: '',
                notes: ''
            });
            fetchData(); // Refresh list
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
                            const isActive = item.href === '/leaves';
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
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Leaves / Vacation</h1>
                                <p className="text-gray-500 mt-1">Manage employee leave requests and track history.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                New Leave Request
                            </button>
                        </div>

                        {/* Leaves History Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Leave History Logs</h3>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading records...</div>
                            ) : leaves.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No leave records found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3">Employee</th>
                                                <th className="px-6 py-3">Type</th>
                                                <th className="px-6 py-3">Dates</th>
                                                <th className="px-6 py-3">Duration</th>
                                                <th className="px-6 py-3">Visa Status</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {leaves.map((leave) => {
                                                const start = new Date(leave.start_date);
                                                const end = new Date(leave.end_date);
                                                const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                                                return (
                                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {leave.employee?.full_name_en || `${leave.employee?.first_name} ${leave.employee?.last_name}`}
                                                            <div className="text-xs text-gray-500 font-normal">{leave.employee?.position}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.leave_type === 'Annual' ? 'bg-blue-100 text-blue-700' :
                                                                leave.leave_type === 'Sick' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {leave.leave_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {start.toLocaleDateString()} - {end.toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                                            {duration} Days
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {leave.exit_reentry_visa ? (
                                                                <div className="text-xs">
                                                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                                                        ✓ Issued
                                                                    </span>
                                                                    <span className="text-gray-500 block mt-0.5">Expires: {new Date(leave.visa_expiry_date).toLocaleDateString()}</span>
                                                                    <span className="text-gray-500 block">{leave.visa_duration_days} Days Duration</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {leave.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                                            {new Date(leave.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* New Leave Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">New Leave Request</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employee Select */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee *</label>
                                    <select
                                        required
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.full_name_en || `${emp.first_name} ${emp.last_name}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Leave Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                                    <select
                                        required
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                    >
                                        <option value="Annual">Annual Leave</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Unpaid">Unpaid Leave</option>
                                        <option value="Emergency">Emergency Leave</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Dates */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>

                                {/* Exit/Re-entry Visa Section */}
                                <div className="col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="exitReentry"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                            checked={formData.exit_reentry_visa}
                                            onChange={(e) => setFormData({ ...formData, exit_reentry_visa: e.target.checked })}
                                        />
                                        <label htmlFor="exitReentry" className="text-sm font-medium text-gray-900">
                                            Include Exit/Re-entry Visa
                                        </label>
                                    </div>

                                    {formData.exit_reentry_visa && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-indigo-200">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Visa Duration (Days) *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    placeholder="e.g. 30, 60, 90"
                                                    className="w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                                    value={formData.visa_duration_days}
                                                    onChange={(e) => setFormData({ ...formData, visa_duration_days: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Last Date of Entry *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    className="w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                                    value={formData.visa_expiry_date}
                                                    onChange={(e) => setFormData({ ...formData, visa_expiry_date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Comments</label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any additional details..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors flex items-center gap-2"
                                >
                                    Create Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
