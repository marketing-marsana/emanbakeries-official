'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '../components/navigation/AppLayout';
import {
    CalendarDays,
    Plus,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    FileText,
    Plane,
    MoreVertical,
    X,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Leave {
    id: string;
    employee_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    status: string;
    exit_reentry_visa: boolean;
    visa_duration_days?: number;
    visa_expiry_date?: string;
    notes?: string;
    created_at: string;
    employee?: {
        first_name: string;
        last_name: string;
        full_name_en: string;
        position: string;
    };
}

export default function LeavesPage() {
    const router = useRouter();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        const { data: empData } = await supabase
            .from('employees')
            .select('id, first_name, last_name, full_name_en')
            .eq('status', 'Active')
            .order('first_name');

        if (empData) setEmployees(empData);

        const { data: leaveData } = await supabase
            .from('leaves')
            .select(`
                *,
                employee:employees(first_name, last_name, full_name_en, position)
            `)
            .order('created_at', { ascending: false });

        if (leaveData) {
            setLeaves(leaveData);
            setStats({
                total: leaveData.length,
                pending: leaveData.filter(l => l.status === 'Pending').length,
                approved: leaveData.filter(l => l.status === 'Approved').length,
                rejected: leaveData.filter(l => l.status === 'Rejected').length
            });
        }

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
            fetchData();
        }
    };

    const handleStatusUpdate = async (leaveId: string, newStatus: string) => {
        const { error } = await supabase
            .from('leaves')
            .update({ status: newStatus })
            .eq('id', leaveId);

        if (error) {
            alert('Error updating status: ' + error.message);
        } else {
            fetchData();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-600 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-600 border-red-200';
            case 'Pending': return 'bg-orange-100 text-orange-600 border-orange-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            case 'Pending': return <Clock size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const calculateDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return days;
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
        const matchesSearch =
            leave.employee?.full_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            leave.leave_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            leave.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <AppLayout>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Manage and track {stats.total} leave requests
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Request Leave
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                                    <CalendarDays size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.total}</h3>
                            <p className="text-sm font-medium text-slate-500">Total Requests</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Clock size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.pending}</h3>
                            <p className="text-sm font-medium text-slate-500">Pending Approval</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.approved}</h3>
                            <p className="text-sm font-medium text-slate-500">Approved</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <XCircle size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.rejected}</h3>
                            <p className="text-sm font-medium text-slate-500">Rejected</p>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-full lg:w-96 border border-slate-200/60 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                                <Search className="text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by employee or leave type..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-slate-600 ml-3 w-full placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Leaves List */}
                    <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">Leave Requests</h2>
                            <p className="text-sm text-slate-500 mt-1">Showing {filteredLeaves.length} of {leaves.length} requests</p>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredLeaves.length > 0 ? filteredLeaves.map((leave, index) => (
                                <motion.div
                                    key={leave.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="p-6 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-semibold text-sm shrink-0 group-hover:scale-110 transition-transform">
                                            {leave.employee?.full_name_en?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base">
                                                        {leave.employee?.full_name_en || 'Unknown Employee'}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">{leave.employee?.position || 'No Position'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${getStatusColor(leave.status)}`}>
                                                        {getStatusIcon(leave.status)}
                                                        {leave.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <span className="text-slate-600 font-medium">{leave.leave_type} Leave</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={16} className="text-slate-400" />
                                                    <span className="text-slate-600">
                                                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock size={16} className="text-slate-400" />
                                                    <span className="text-slate-600 font-semibold">
                                                        {calculateDuration(leave.start_date, leave.end_date)} Days
                                                    </span>
                                                </div>
                                            </div>

                                            {leave.exit_reentry_visa && (
                                                <div className="mt-3 flex items-center gap-2 text-sm">
                                                    <Plane size={16} className="text-blue-500" />
                                                    <span className="text-blue-600 font-medium">
                                                        Exit Re-entry Visa ({leave.visa_duration_days} days)
                                                    </span>
                                                </div>
                                            )}

                                            {leave.notes && (
                                                <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                                                    <span className="font-semibold text-slate-700">Notes:</span> {leave.notes}
                                                </p>
                                            )}

                                            {leave.status === 'Pending' && (
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => handleStatusUpdate(leave.id, 'Approved')}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(leave.id, 'Rejected')}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <XCircle size={14} />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button className="text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-12 text-center">
                                    <CalendarDays className="mx-auto text-slate-300 mb-4" size={48} />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No leave requests found</h3>
                                    <p className="text-sm text-slate-400">Adjust your filters or create a new request</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Create Leave Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between rounded-t-3xl">
                                <h2 className="text-xl font-bold text-slate-900">Request New Leave</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <X size={20} className="text-slate-600" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Employee</label>
                                    <select
                                        required
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.full_name_en || `${emp.first_name} ${emp.last_name}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
                                    <select
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="Annual">Annual Leave</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Emergency">Emergency Leave</option>
                                        <option value="Unpaid">Unpaid Leave</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <input
                                        type="checkbox"
                                        id="exitReentry"
                                        checked={formData.exit_reentry_visa}
                                        onChange={(e) => setFormData({ ...formData, exit_reentry_visa: e.target.checked })}
                                        className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-100"
                                    />
                                    <label htmlFor="exitReentry" className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                        <Plane size={16} />
                                        Requires Exit Re-entry Visa
                                    </label>
                                </div>

                                {formData.exit_reentry_visa && (
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Visa Duration (Days)</label>
                                            <input
                                                type="number"
                                                value={formData.visa_duration_days}
                                                onChange={(e) => setFormData({ ...formData, visa_duration_days: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Visa Expiry Date</label>
                                            <input
                                                type="date"
                                                value={formData.visa_expiry_date}
                                                onChange={(e) => setFormData({ ...formData, visa_expiry_date: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any additional information..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                                    >
                                        Submit Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
