'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { navItems } from '@/app/components/enhanced/navConfig';
import { useRouter } from 'next/navigation';
import { CalendarDays, FileDown, Calculator, DollarSign, CalendarCheck } from 'lucide-react';

export default function PayrollPage() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // State
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasExistingRecords, setHasExistingRecords] = useState(false);

    useEffect(() => {
        fetchPayrollData();
    }, [selectedMonth]);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);

            // 1. Check if payroll exists for this month
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
                setPayrollData(existingRecords.map(record => ({
                    ...record,
                    employee_name: record.employee?.full_name_en || 'Unknown',
                    employee_position: record.employee?.position,
                    basic_salary: record.salary_basic
                })));
            } else {
                setHasExistingRecords(false);
                setPayrollData([]); // Clear previous data
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

            // 1. Fetch all active employees
            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('status', 'Active');

            if (empError) throw empError;

            // 2. Fetch all approved leaves overlapping the selected month
            // Selected Month: YYYY-MM
            const [year, month] = selectedMonth.split('-');
            const startDate = `${selectedMonth}-01`;
            const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().slice(0, 10); // Last day of month

            // Query leaves: (start <= end_of_month) AND (end >= start_of_month) AND status IN ('Approved', 'Completed')
            const { data: leaves, error: leaveError } = await supabase
                .from('leaves')
                .select('*')
                .in('status', ['Approved', 'Completed'])
                .lte('start_date', endDate)
                .gte('end_date', startDate);

            if (leaveError) throw leaveError;

            // 3. Calculate Payroll for each employee
            const computedPayroll = employees.map(emp => {
                const empLeaves = leaves?.filter(l => l.employee_id === emp.id) || [];

                // Calculate leave days in this month
                let leaveDays = 0;
                empLeaves.forEach(leave => {
                    const lStart = new Date(leave.start_date);
                    const lEnd = new Date(leave.end_date);
                    const mStart = new Date(startDate);
                    const mEnd = new Date(endDate);

                    // Intersection
                    const start = lStart > mStart ? lStart : mStart;
                    const end = lEnd < mEnd ? lEnd : mEnd;

                    if (start <= end) {
                        const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
                        leaveDays += Math.round(days); // Round to integer days
                    }
                });

                // Payroll Rules:
                // Base: 30 days
                // Working Days = 30 - Leave Days (Cap at 0)
                // Daily Rate = Salary / 30

                const baseSalary = emp.salary || 0;
                // If started this month? Handle partial month joiners? 
                // User requirement: "If employee starts vacation on 10th... pay for 10 working days".
                // Doesn't mention join date. Assuming full month employment unless logic added.
                // Assuming 30 days standard.

                const workingDays = Math.max(0, 30 - leaveDays);
                const dailyRate = baseSalary / 30;
                let finalSalary = dailyRate * workingDays;

                // Rounding
                finalSalary = Math.round(finalSalary * 100) / 100;

                return {
                    employee_id: emp.id,
                    employee_name: emp.full_name_en,
                    employee_position: emp.position,
                    month: selectedMonth,
                    salary_basic: baseSalary,
                    housing_allowance: 0, // Placeholder
                    other_allowance: 0, // Placeholder
                    deductions: 0, // Placeholder
                    working_days: workingDays,
                    leave_days: leaveDays,
                    final_salary: finalSalary,
                    status: 'Draft'
                };
            });

            setPayrollData(computedPayroll);
            setHasExistingRecords(false); // Because it's a new generation (or preview)

        } catch (err) {
            console.error('Error generating payroll:', err);
            alert('Failed to generate payroll calculations.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSavePayroll = async () => {
        if (payrollData.length === 0) return;

        try {
            setSaving(true);

            // Upsert each record
            // Since we added UNIQUE constraint on (employee_id, month), standard Insert might fail if not using Upsert.
            // Upsert based on conflict.

            const recordsToInsert = payrollData.map(({ employee_name, employee_position, ...record }) => record);

            const { error } = await supabase
                .from('payroll_records')
                .upsert(recordsToInsert, { onConflict: 'employee_id, month' });

            if (error) throw error;

            alert('Payroll saved successfully!');
            setHasExistingRecords(true);
            fetchPayrollData(); // Refresh to ensure sync

        } catch (err) {
            console.error('Error saving payroll:', err);
            alert('Failed to save payroll records.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportCSV = () => {
        if (payrollData.length === 0) return;

        const headers = ['Employee ID', 'Name', 'Position', 'Basic Salary', 'Leave Days', 'Working Days', 'Final Salary', 'Status'];
        const csvContent = [
            headers.join(','),
            ...payrollData.map(row => [
                row.employee_id,
                `"${row.employee_name}"`,
                `"${row.employee_position}"`,
                row.salary_basic,
                row.leave_days,
                row.working_days,
                row.final_salary,
                row.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payroll_${selectedMonth}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Top Navigation Bar - reused structure */}
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
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                            HR
                        </div>
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
                            const isActive = item.href === '/payroll';
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
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">Payroll Generation</h2>
                                <p className="text-gray-600">Calculate and manage monthly salary payments.</p>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <div className="flex flex-wrap items-end gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={parseInt(selectedMonth.split('-')[0])}
                                            onChange={(e) => {
                                                const newYear = e.target.value;
                                                const month = selectedMonth.split('-')[1];
                                                setSelectedMonth(`${newYear}-${month}`);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                        >
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedMonth.split('-')[1]}
                                            onChange={(e) => {
                                                const year = selectedMonth.split('-')[0];
                                                const newMonth = e.target.value;
                                                setSelectedMonth(`${year}-${newMonth}`);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const m = (i + 1).toString().padStart(2, '0');
                                                const date = new Date(2000, i, 1); // 2000 is generic
                                                return { value: m, label: date.toLocaleString('default', { month: 'long' }) };
                                            }).map(({ value, label }) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGeneratePayroll}
                                        disabled={generating || saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                                    >
                                        <Calculator className="w-5 h-5" />
                                        {generating ? 'Calculating...' : (hasExistingRecords ? 'Re-Calculate' : 'Generate Payroll')}
                                    </button>

                                    {!hasExistingRecords && payrollData.length > 0 && (
                                        <button
                                            onClick={handleSavePayroll}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                                        >
                                            <CalendarCheck className="w-5 h-5" />
                                            {saving ? 'Saving...' : 'Save Records'}
                                        </button>
                                    )}

                                    {(hasExistingRecords || payrollData.length > 0) && (
                                        <button
                                            onClick={handleExportCSV}
                                            className="flex items-center gap-2 px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
                                        >
                                            <FileDown className="w-5 h-5" />
                                            Export CSV
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Payroll ({selectedMonth})</h3>
                                <span className="text-sm text-gray-500">{payrollData.length} records</span>
                            </div>

                            {loading ? (
                                <div className="p-12 flex justify-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : payrollData.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    No payroll data found for this month. Click "Generate Payroll" to start.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Basic Salary</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Leave Days</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Working Days</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {payrollData.map((record, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{record.employee_name}</p>
                                                            <p className="text-xs text-gray-500">{record.employee_id.slice(0, 8)}...</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                            {record.employee_position || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right tabular-nums text-gray-600">
                                                        {record.salary_basic?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.leave_days > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                                                            {record.leave_days}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium text-gray-900">
                                                        {record.working_days}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-indigo-600 tabular-nums">
                                                        {record.final_salary?.toLocaleString()} SAR
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                            hasExistingRecords ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {hasExistingRecords ? 'Saved' : 'Draft'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-right font-semibold text-gray-900">Total Calculation:</td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-700 text-lg">
                                                    {payrollData.reduce((sum, r) => sum + (r.final_salary || 0), 0).toLocaleString()} SAR
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
