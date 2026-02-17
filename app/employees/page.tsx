'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '../components/navigation/AppLayout';
import {
    Search,
    Filter,
    Grid3x3,
    List,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    MapPin,
    X,
    User,
    ExternalLink,
    FileText,
    Shield,
    Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    leaves?: any[];
}

export default function EmployeesPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDetailedView, setShowDetailedView] = useState(false);
    const [complianceData, setComplianceData] = useState<any>(null);

    useEffect(() => {
        fetchEmployees();
    }, [statusFilter]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('employees')
                .select('*, leaves(start_date, end_date, status)')
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

    const fetchComplianceData = async (employeeId: string) => {
        try {
            const { data, error } = await supabase
                .from('employee_compliance')
                .select('*')
                .eq('employee_id', employeeId)
                .single();

            if (error) {
                console.error('Error fetching compliance data:', error);
                setComplianceData(null);
            } else {
                setComplianceData(data);
            }
        } catch (err) {
            console.error('Error:', err);
            setComplianceData(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-600';
            case 'on leave': return 'bg-orange-100 text-orange-600';
            case 'terminated': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getInitials = (first: string, last: string) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchQuery.toLowerCase();
        return (
            emp.full_name_en?.toLowerCase().includes(searchLower) ||
            emp.first_name?.toLowerCase().includes(searchLower) ||
            emp.last_name?.toLowerCase().includes(searchLower) ||
            emp.position?.toLowerCase().includes(searchLower) ||
            emp.department?.toLowerCase().includes(searchLower)
        );
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <AppLayout>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Employees</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Manage your workforce of {employees.length} team members
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/employees/workflow/add')}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Employee
                    </button>
                </div>
            </header>

            {/* Filters & Search Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search */}
                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-full lg:w-96 border border-slate-200/60 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Search className="text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, position, department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-slate-600 ml-3 w-full placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                    ? 'bg-white text-orange-500 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Grid3x3 size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                    ? 'bg-white text-orange-500 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10"
                        >
                            {filteredEmployees.map((employee) => (
                                <motion.div
                                    key={employee.id}
                                    variants={itemVariants}
                                    onClick={() => setSelectedEmployee(employee)}
                                    className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-lg group-hover:scale-110 transition-transform">
                                            {getInitials(employee.first_name, employee.last_name)}
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate">
                                        {employee.full_name_en || `${employee.first_name} ${employee.last_name}`}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-1">{employee.position}</p>
                                    <p className="text-xs text-slate-400 mb-4">{employee.department}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(employee.status)}`}>
                                            {employee.status}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            ID: {employee.identity_number?.slice(-4) || '****'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map((employee, index) => (
                                            <motion.tr
                                                key={employee.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedEmployee(employee)}
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-semibold text-sm">
                                                            {getInitials(employee.first_name, employee.last_name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">
                                                                {employee.full_name_en || `${employee.first_name} ${employee.last_name}`}
                                                            </p>
                                                            <p className="text-xs text-slate-400">ID: {employee.identity_number?.slice(-4) || '****'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600">{employee.position}</td>
                                                <td className="py-4 px-6 text-sm text-slate-600">{employee.department}</td>
                                                <td className="py-4 px-6">
                                                    <div className="text-xs text-slate-500">
                                                        <p className="mb-1">{employee.email || 'No email'}</p>
                                                        <p>{employee.phone || 'No phone'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(employee.status)}`}>
                                                        {employee.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button className="text-slate-400 hover:text-slate-700 transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {filteredEmployees.length === 0 && (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                            <User className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No employees found</h3>
                            <p className="text-sm text-slate-400">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </>
            )}

            {/* Employee Detail Modal */}
            <AnimatePresence>
                {selectedEmployee && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedEmployee(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between rounded-t-3xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-2xl">
                                        {getInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {selectedEmployee.full_name_en || `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                                        </h2>
                                        <p className="text-sm text-slate-500">{selectedEmployee.position} • {selectedEmployee.department}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <X size={20} className="text-slate-600" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold px-4 py-2 rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                                        {selectedEmployee.status}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        Joined {new Date(selectedEmployee.joining_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail size={16} className="text-slate-400" />
                                            <span className="text-slate-600">{selectedEmployee.email || 'No email provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone size={16} className="text-slate-400" />
                                            <span className="text-slate-600">{selectedEmployee.phone || 'No phone provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span className="text-slate-600">{selectedEmployee.nationality || 'No nationality'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Employment Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Employee ID</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedEmployee.identity_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Iqama Number</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedEmployee.iqama_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Iqama Expiry</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {selectedEmployee.iqama_expiry ? new Date(selectedEmployee.iqama_expiry).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Contract End</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {selectedEmployee.contract_end ? new Date(selectedEmployee.contract_end).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* GOVERNMENT PORTALS - RESTORED */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-100">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Shield size={16} className="text-orange-600" />
                                        Government Portals Access
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Qiwa Portal */}
                                        <a
                                            href={`https://qiwa.sa`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-white hover:bg-orange-600 border-2 border-orange-200 hover:border-orange-600 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Building2 size={24} className="text-orange-600 group-hover:text-white transition-colors" />
                                                <ExternalLink size={14} className="text-orange-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors text-sm">Qiwa</h4>
                                            <p className="text-xs text-slate-500 group-hover:text-orange-100 transition-colors mt-1">Labor Platform</p>
                                        </a>

                                        {/* Muqeem Portal */}
                                        <a
                                            href={`https://muqeem.sa`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-white hover:bg-green-600 border-2 border-green-200 hover:border-green-600 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <FileText size={24} className="text-green-600 group-hover:text-white transition-colors" />
                                                <ExternalLink size={14} className="text-green-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors text-sm">Muqeem</h4>
                                            <p className="text-xs text-slate-500 group-hover:text-green-100 transition-colors mt-1">Iqama: {selectedEmployee.iqama_number || 'N/A'}</p>
                                        </a>

                                        {/* GOSI Portal */}
                                        <a
                                            href={`https://online.gosi.gov.sa`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-white hover:bg-blue-600 border-2 border-blue-200 hover:border-blue-600 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Shield size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                                                <ExternalLink size={14} className="text-blue-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors text-sm">GOSI</h4>
                                            <p className="text-xs text-slate-500 group-hover:text-blue-100 transition-colors mt-1">Social Insurance</p>
                                        </a>

                                        {/* Mudad Portal */}
                                        <a
                                            href={`https://mudad.sa`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-white hover:bg-purple-600 border-2 border-purple-200 hover:border-purple-600 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Calendar size={24} className="text-purple-600 group-hover:text-white transition-colors" />
                                                <ExternalLink size={14} className="text-purple-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors text-sm">Mudad</h4>
                                            <p className="text-xs text-slate-500 group-hover:text-purple-100 transition-colors mt-1">Payroll Portal</p>
                                        </a>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailedView(!showDetailedView);
                                            if (!showDetailedView && selectedEmployee) {
                                                fetchComplianceData(selectedEmployee.id);
                                            }
                                        }}
                                        className="px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                                    >
                                        {showDetailedView ? 'Hide' : 'View'} Portal Details
                                        <FileText size={16} />
                                    </button>
                                </div>

                                {/* DETAILED VIEW - Portal Compliance Data */}
                                {showDetailedView && complianceData && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 space-y-4"
                                    >
                                        {/* Qiwa Data */}
                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Building2 size={20} className="text-orange-600" />
                                                <h4 className="font-bold text-slate-900">Qiwa Platform Data</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-slate-500">Status</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.qiwa_status || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Occupation</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.occupation || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Skill Level</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.skill_level || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employee ID</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.employee_id_qiwa || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Muqeem Data */}
                                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <FileText size={20} className="text-green-600" />
                                                <h4 className="font-bold text-slate-900">Muqeem (Residency) Data</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-slate-500">Iqama Number</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.iqama_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Iqama Expiry</p>
                                                    <p className="font-semibold text-slate-800">
                                                        {complianceData.iqama_expiry ? new Date(complianceData.iqama_expiry).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Passport Number</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.passport_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Passport Expiry</p>
                                                    <p className="font-semibold text-slate-800">
                                                        {complianceData.passport_expiry ? new Date(complianceData.passport_expiry).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* GOSI Data */}
                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Shield size={20} className="text-blue-600" />
                                                <h4 className="font-bold text-slate-900">GOSI (Social Insurance) Data</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-slate-500">GOSI Number</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.gosi_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Basic Wage</p>
                                                    <p className="font-semibold text-slate-800">SAR {complianceData.gosi_wage || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Pension Eligibility</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.pension_eligible ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Joining Date</p>
                                                    <p className="font-semibold text-slate-800">
                                                        {complianceData.gosi_joining_date ? new Date(complianceData.gosi_joining_date).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mudad Data */}
                                        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar size={20} className="text-purple-600" />
                                                <h4 className="font-bold text-slate-900">Mudad (Payroll) Data</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-slate-500">Status</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.mudad_status || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Salary</p>
                                                    <p className="font-semibold text-slate-800">SAR {complianceData.mudad_salary || 'N/A'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-slate-500">IBAN</p>
                                                    <p className="font-semibold text-slate-800">{complianceData.iban || 'Add IBAN Number'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
