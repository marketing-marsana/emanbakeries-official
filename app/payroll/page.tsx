'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '../components/navigation/AppLayout';
import {
    DollarSign,
    Calendar,
    Download,
    Calculator,
    TrendingUp,
    Users,
    FileText,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Plus,
    RefreshCw,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PayrollRecord {
    id?: string;
    employee_id: string;
    employee_name: string;
    employee_position: string;
    month: string;
    basic_salary: number;
    salary_basic: number;
    allowances: number;
    deductions: number;
    leave_days: number;
    net_salary: number;
    status: string;
}

export default function PayrollPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasExistingRecords, setHasExistingRecords] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [stats, setStats] = useState({
        totalPayroll: 0,
        totalEmployees: 0,
        totalDeductions: 0,
        averageSalary: 0
    });

    useEffect(() => {
        fetchPayrollData();
    }, [selectedMonth]);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);

            const { data: existingRecords, error } = await supabase
                .from('payroll_records')
                .select(`
                    *,
                    employee:employees(id, full_name_en, arabic_name, position, department, joining_date, salary)
                `)
                .eq('month', selectedMonth);

            if (error) throw error;

            if (existingRecords && existingRecords.length > 0) {
                setHasExistingRecords(true);
                const formattedData = existingRecords.map(record => ({
                    ...record,
                    employee_name: record.employee?.full_name_en || 'Unknown',
                    employee_position: record.employee?.position,
                    basic_salary: record.salary_basic
                }));
                setPayrollData(formattedData);

                const totalPayroll = formattedData.reduce((sum, r) => sum + (r.net_salary || 0), 0);
                const totalDeductions = formattedData.reduce((sum, r) => sum + (r.deductions || 0), 0);

                setStats({
                    totalPayroll,
                    totalEmployees: formattedData.length,
                    totalDeductions,
                    averageSalary: formattedData.length > 0 ? totalPayroll / formattedData.length : 0
                });
            } else {
                setHasExistingRecords(false);
                setPayrollData([]);
                setStats({ totalPayroll: 0, totalEmployees: 0, totalDeductions: 0, averageSalary: 0 });
            }

        } catch (err) {
            console.error('Error fetching payroll:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            setGenerating(true);

            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('status', 'Active');

            if (empError) throw empError;

            const [year, month] = selectedMonth.split('-');
            const startDate = `${selectedMonth}-01`;
            const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().slice(0, 10);

            const { data: leaves } = await supabase
                .from('leaves')
                .select('*')
                .in('status', ['Approved', 'Completed'])
                .lte('start_date', endDate)
                .gte('end_date', startDate);

            const computedPayroll = employees.map(emp => {
                const empLeaves = leaves?.filter(l => l.employee_id === emp.id) || [];

                let leaveDays = 0;
                empLeaves.forEach(leave => {
                    const lStart = new Date(leave.start_date);
                    const lEnd = new Date(leave.end_date);
                    const mStart = new Date(startDate);
                    const mEnd = new Date(endDate);

                    const overlapStart = lStart > mStart ? lStart : mStart;
                    const overlapEnd = lEnd < mEnd ? lEnd : mEnd;

                    if (overlapStart <= overlapEnd) {
                        const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        leaveDays += days;
                    }
                });

                const baseSalary = emp.salary || 0;
                const allowances = 0;
                const deductions = (baseSalary / 30) * leaveDays;
                const netSalary = baseSalary + allowances - deductions;

                return {
                    employee_id: emp.id,
                    employee_name: emp.full_name_en,
                    employee_position: emp.position,
                    month: selectedMonth,
                    basic_salary: baseSalary,
                    salary_basic: baseSalary,
                    allowances,
                    deductions,
                    leave_days: leaveDays,
                    net_salary: netSalary,
                    status: 'Draft'
                };
            });

            setPayrollData(computedPayroll);
            setHasExistingRecords(false);

            const totalPayroll = computedPayroll.reduce((sum, r) => sum + r.net_salary, 0);
            const totalDeductions = computedPayroll.reduce((sum, r) => sum + r.deductions, 0);

            setStats({
                totalPayroll,
                totalEmployees: computedPayroll.length,
                totalDeductions,
                averageSalary: computedPayroll.length > 0 ? totalPayroll / computedPayroll.length : 0
            });

        } catch (err) {
            console.error('Error generating payroll:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleSavePayroll = async () => {
        try {
            setSaving(true);

            const recordsToSave = payrollData.map(record => ({
                employee_id: record.employee_id,
                month: selectedMonth,
                salary_basic: record.basic_salary,
                allowances: record.allowances || 0,
                deductions: record.deductions || 0,
                leave_days: record.leave_days || 0,
                net_salary: record.net_salary,
                status: 'Processed'
            }));

            const { error } = await supabase
                .from('payroll_records')
                .insert(recordsToSave);

            if (error) throw error;

            await fetchPayrollData();
            alert('Payroll saved successfully!');

        } catch (err) {
            console.error('Error saving payroll:', err);
            alert('Error saving payroll');
        } finally {
            setSaving(false);
        }
    };

    const filteredPayroll = payrollData.filter(record =>
        record.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employee_position?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payroll Management</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Process monthly salaries for {stats.totalEmployees} employees
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 cursor-pointer"
                        />
                    </div>
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
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                                SAR {stats.totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">Total Payroll</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.totalEmployees}</h3>
                            <p className="text-sm font-medium text-slate-500">Employees</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                                SAR {stats.averageSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">Average Salary</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                                SAR {stats.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">Total Deductions</p>
                        </motion.div>
                    </div>

                    {/* Actions Bar */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-full lg:w-96 border border-slate-200/60">
                                <Search className="text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-slate-600 ml-3 w-full placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            <div className="flex gap-3">
                                {!hasExistingRecords && (
                                    <button
                                        onClick={handleGeneratePayroll}
                                        disabled={generating}
                                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generating ? <RefreshCw size={18} className="animate-spin" /> : <Calculator size={18} />}
                                        {generating ? 'Generating...' : 'Generate Payroll'}
                                    </button>
                                )}

                                {payrollData.length > 0 && !hasExistingRecords && (
                                    <button
                                        onClick={handleSavePayroll}
                                        disabled={saving}
                                        className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        {saving ? 'Saving...' : 'Save Payroll'}
                                    </button>
                                )}

                                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    <Download size={18} />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payroll Table */}
                    {payrollData.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Payroll for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {hasExistingRecords ? 'Processed Records' : 'Draft - Not yet saved'}
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                            <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Basic Salary</th>
                                            <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Allowances</th>
                                            <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Deductions</th>
                                            <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Leave Days</th>
                                            <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Net Salary</th>
                                            <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayroll.map((record, index) => (
                                            <motion.tr
                                                key={record.employee_id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-semibold text-xs">
                                                            {record.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <span className="font-semibold text-slate-900 text-sm">
                                                            {record.employee_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600">{record.employee_position}</td>
                                                <td className="py-4 px-6 text-sm text-slate-900 font-semibold text-right">
                                                    SAR {record.basic_salary?.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-green-600 font-semibold text-right">
                                                    +{record.allowances?.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-red-600 font-semibold text-right">
                                                    -{record.deductions?.toFixed(2)}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                                        {record.leave_days || 0} days
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-base text-slate-900 font-bold text-right">
                                                    SAR {record.net_salary?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <button className="text-slate-400 hover:text-slate-700 transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Footer */}
                            <div className="bg-slate-50 p-6 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-slate-600">
                                        <span className="font-medium">Total Records:</span> {filteredPayroll.length}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-1">Total Payroll Amount</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            SAR {stats.totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Payroll Data</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Generate payroll for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <button
                                onClick={handleGeneratePayroll}
                                disabled={generating}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                            >
                                {generating ? <RefreshCw size={18} className="animate-spin" /> : <Calculator size={18} />}
                                {generating ? 'Generating...' : 'Generate Payroll'}
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AppLayout>
    );
}
