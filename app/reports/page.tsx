'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '../components/navigation/AppLayout';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Download,
    Calendar,
    Users,
    DollarSign,
    FileText,
    AlertTriangle,
    Clock,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportData {
    employees: any[];
    leaves: any[];
    payroll: any[];
    compliance: any[];
}

interface AnalyticsData {
    employeeGrowth: number;
    leaveUtilization: number;
    payrollTrend: number;
    complianceScore: number;
    departmentBreakdown: { [key: string]: number };
    leaveTypeBreakdown: { [key: string]: number };
    monthlyPayroll: { [key: string]: number };
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData>({
        employees: [],
        leaves: [],
        payroll: [],
        compliance: []
    });
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        employeeGrowth: 0,
        leaveUtilization: 0,
        payrollTrend: 0,
        complianceScore: 0,
        departmentBreakdown: {},
        leaveTypeBreakdown: {},
        monthlyPayroll: {}
    });

    const [selectedReport, setSelectedReport] = useState<string>('overview');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Fetch all employees
            const { data: employees } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch leaves within date range
            const { data: leaves } = await supabase
                .from('leaves')
                .select('*, employee:employees(full_name_en, department, position)')
                .gte('start_date', dateRange.start)
                .lte('end_date', dateRange.end);

            // Fetch payroll records
            const { data: payroll } = await supabase
                .from('payroll_records')
                .select('*, employee:employees(full_name_en, department)')
                .order('month', { ascending: false })
                .limit(12);

            // Fetch compliance data
            const { data: compliance } = await supabase
                .from('employee_compliance')
                .select('*');

            setReportData({
                employees: employees || [],
                leaves: leaves || [],
                payroll: payroll || [],
                compliance: compliance || []
            });

            // Calculate analytics
            calculateAnalytics(employees || [], leaves || [], payroll || [], compliance || []);

        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (employees: any[], leaves: any[], payroll: any[], compliance: any[]) => {
        // Employee Growth (comparing last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const recentEmployees = employees.filter(e => new Date(e.created_at) >= thirtyDaysAgo).length;
        const previousEmployees = employees.filter(e =>
            new Date(e.created_at) >= sixtyDaysAgo && new Date(e.created_at) < thirtyDaysAgo
        ).length;
        const employeeGrowth = previousEmployees > 0 ? ((recentEmployees - previousEmployees) / previousEmployees * 100) : 0;

        // Leave Utilization
        const totalEmployees = employees.filter(e => e.status === 'Active').length;
        const employeesOnLeave = leaves.filter(l => l.status === 'Approved').length;
        const leaveUtilization = totalEmployees > 0 ? (employeesOnLeave / totalEmployees * 100) : 0;

        // Payroll Trend
        const sortedPayroll = [...payroll].sort((a, b) => a.month.localeCompare(b.month));
        const lastMonthPayroll = sortedPayroll[sortedPayroll.length - 1]?.net_salary || 0;
        const previousMonthPayroll = sortedPayroll[sortedPayroll.length - 2]?.net_salary || 0;
        const payrollTrend = previousMonthPayroll > 0 ? ((lastMonthPayroll - previousMonthPayroll) / previousMonthPayroll * 100) : 0;

        // Compliance Score (percentage with complete compliance data)
        const compliantEmployees = compliance.filter(c =>
            c.iqama_number && c.iqama_expiry && c.passport_number && c.passport_expiry
        ).length;
        const complianceScore = employees.length > 0 ? (compliantEmployees / employees.length * 100) : 0;

        // Department Breakdown
        const departmentBreakdown = employees.reduce((acc, emp) => {
            const dept = emp.department || 'Unassigned';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // Leave Type Breakdown
        const leaveTypeBreakdown = leaves.reduce((acc, leave) => {
            const type = leave.leave_type || 'Other';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // Monthly Payroll
        const monthlyPayroll = payroll.reduce((acc, record) => {
            const month = record.month;
            acc[month] = (acc[month] || 0) + (record.net_salary || 0);
            return acc;
        }, {} as { [key: string]: number });

        setAnalytics({
            employeeGrowth,
            leaveUtilization,
            payrollTrend,
            complianceScore,
            departmentBreakdown,
            leaveTypeBreakdown,
            monthlyPayroll
        });
    };

    const reportTypes = [
        {
            id: 'overview',
            name: 'Overview Dashboard',
            icon: Activity,
            color: 'orange',
            description: 'High-level metrics and KPIs'
        },
        {
            id: 'employees',
            name: 'Employee Analytics',
            icon: Users,
            color: 'blue',
            description: 'Workforce composition and trends'
        },
        {
            id: 'leaves',
            name: 'Leave Report',
            icon: Calendar,
            color: 'purple',
            description: 'Leave patterns and utilization'
        },
        {
            id: 'payroll',
            name: 'Payroll Analysis',
            icon: DollarSign,
            color: 'green',
            description: 'Salary distribution and costs'
        },
        {
            id: 'compliance',
            name: 'Compliance Status',
            icon: AlertTriangle,
            color: 'red',
            description: 'Document expiry and alerts'
        }
    ];

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

    const getColorClasses = (color: string) => {
        const colors: { [key: string]: { bg: string, text: string, hover: string } } = {
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100' },
            red: { bg: 'bg-red-50', text: 'text-red-600', hover: 'hover:bg-red-100' }
        };
        return colors[color] || colors.orange;
    };

    return (
        <AppLayout>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Advanced insights and data visualization
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 gap-2 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent border-none outline-none text-slate-700 font-medium"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-transparent border-none outline-none text-slate-700 font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchReportData}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw size={18} className="text-slate-600" />
                    </button>
                    <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2">
                        <Download size={18} />
                        Export All
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${analytics.employeeGrowth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {analytics.employeeGrowth >= 0 ? '+' : ''}{analytics.employeeGrowth.toFixed(1)}%
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{reportData.employees.length}</h3>
                            <p className="text-sm font-medium text-slate-500">Total Employees</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <Calendar size={24} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                                    {analytics.leaveUtilization.toFixed(1)}%
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{reportData.leaves.length}</h3>
                            <p className="text-sm font-medium text-slate-500">Leave Requests</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                    <DollarSign size={24} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${analytics.payrollTrend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {analytics.payrollTrend >= 0 ? '+' : ''}{analytics.payrollTrend.toFixed(1)}%
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                                SAR {Object.values(analytics.monthlyPayroll).reduce((a, b) => a + b, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">Total Payroll (Period)</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <AlertTriangle size={24} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                                    {analytics.complianceScore.toFixed(0)}%
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{reportData.compliance.length}</h3>
                            <p className="text-sm font-medium text-slate-500">Compliance Records</p>
                        </motion.div>
                    </div>

                    {/* Report Type Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                        {reportTypes.map((report) => {
                            const Icon = report.icon;
                            const colors = getColorClasses(report.color);
                            const isActive = selectedReport === report.id;

                            return (
                                <motion.button
                                    key={report.id}
                                    variants={itemVariants}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left ${isActive
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-300'
                                            : `bg-white border-slate-100 hover:border-slate-200 hover:shadow-md ${colors.hover}`
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isActive ? 'bg-white/10 text-white' : `${colors.bg} ${colors.text}`
                                        }`}>
                                        <Icon size={20} />
                                    </div>
                                    <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                        {report.name}
                                    </h3>
                                    <p className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                        {report.description}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Report Content */}
                    {selectedReport === 'overview' && (
                        <div className="space-y-6">
                            {/* Department Breakdown */}
                            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Employee Distribution by Department</h2>
                                        <p className="text-sm text-slate-500 mt-1">Current workforce breakdown</p>
                                    </div>
                                    <BarChart3 className="text-slate-400" size={24} />
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(analytics.departmentBreakdown).map(([dept, count], index) => {
                                        const percentage = (count / reportData.employees.length * 100).toFixed(1);
                                        return (
                                            <div key={dept} className="group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-semibold text-slate-700">{dept}</span>
                                                    <span className="text-sm font-bold text-slate-900">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full group-hover:from-orange-500 group-hover:to-orange-700 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Leave Type Breakdown */}
                            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Leave Requests by Type</h2>
                                        <p className="text-sm text-slate-500 mt-1">Distribution across categories</p>
                                    </div>
                                    <PieChart className="text-slate-400" size={24} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(analytics.leaveTypeBreakdown).map(([type, count]) => (
                                        <div key={type} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <p className="text-2xl font-bold text-slate-900 mb-1">{count}</p>
                                            <p className="text-xs font-medium text-slate-600">{type} Leave</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedReport === 'employees' && (
                        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Employee Master Report</h2>
                                <p className="text-sm text-slate-500 mt-1">Complete employee listing with details</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Joining Date</th>
                                            <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.employees.slice(0, 20).map((emp, index) => (
                                            <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-semibold text-xs">
                                                            {emp.full_name_en?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'NA'}
                                                        </div>
                                                        <span className="font-semibold text-slate-900 text-sm">{emp.full_name_en || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600">{emp.department || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-600">{emp.position || 'N/A'}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-600' :
                                                            emp.status === 'On Leave' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-red-100 text-red-600'
                                                        }`}>
                                                        {emp.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600">
                                                    {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-900 font-semibold text-right">
                                                    SAR {emp.salary?.toLocaleString() || '0'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
                                Showing {Math.min(20, reportData.employees.length)} of {reportData.employees.length} employees
                            </div>
                        </div>
                    )}

                    {selectedReport === 'leaves' && (
                        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Leave History Report</h2>
                                <p className="text-sm text-slate-500 mt-1">All leave requests in selected period</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Start Date</th>
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">End Date</th>
                                            <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</th>
                                            <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.leaves.map((leave) => {
                                            const duration = Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                            return (
                                                <tr key={leave.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                                                        {leave.employee?.full_name_en || 'Unknown'}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-slate-600">{leave.leave_type}</td>
                                                    <td className="py-4 px-6 text-sm text-slate-600">
                                                        {new Date(leave.start_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-slate-600">
                                                        {new Date(leave.end_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                                            {duration} days
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${leave.status === 'Approved' ? 'bg-green-100 text-green-600' :
                                                                leave.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                                    'bg-orange-100 text-orange-600'
                                                            }`}>
                                                            {leave.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {selectedReport === 'payroll' && (
                        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Payroll Summary Report</h2>
                                <p className="text-sm text-slate-500 mt-1">Monthly payroll breakdown</p>
                            </div>
                            <div className="p-6 space-y-4">
                                {Object.entries(analytics.monthlyPayroll).sort((a, b) => b[0].localeCompare(a[0])).map(([month, total]) => (
                                    <div key={month} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="text-base font-bold text-slate-900">
                                                SAR {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${(total / Math.max(...Object.values(analytics.monthlyPayroll)) * 100)}%` }}
                                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full group-hover:from-green-500 group-hover:to-green-700 transition-all"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedReport === 'compliance' && (
                        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Compliance Status Report</h2>
                                <p className="text-sm text-slate-500 mt-1">Document validity and expiry tracking</p>
                            </div>
                            <div className="p-6">
                                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 mb-1">Overall Compliance Score</p>
                                            <p className="text-4xl font-bold text-blue-900">{analytics.complianceScore.toFixed(1)}%</p>
                                        </div>
                                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                                            <AlertTriangle className="text-blue-600" size={32} />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center py-12">
                                    <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-sm text-slate-500">
                                        {reportData.compliance.length} compliance records tracked
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AppLayout>
    );
}
