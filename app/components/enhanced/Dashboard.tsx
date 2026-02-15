/**
 * ENHANCED DASHBOARD PAGE - JISR STYLE
 * Premium HR 360 Dashboard with Charts, Analytics, and Real-time Data
 * 
 * Features:
 * - KPI Cards with trend indicators
 * - Interactive charts using Recharts
 * - Compliance alerts with severity levels
 * - Activity timeline
 * - Premium animations and micro-interactions
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Users, DollarSign, Activity, ArrowRight } from 'lucide-react';
import {
    Layout,
    PageHeader,
    Card,
    KPICard,
    Button,
    Badge,
    colors,
} from './Layout';

// ============================================================================
// DATA & TYPES
// ============================================================================
interface DashboardData {
    totalEmployees: number;
    saudiEmployees: number;
    expatEmployees: number;
    totalPayroll: number;
    complianceAlerts: Array<{
        id: string;
        type: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        message: string;
        employee: string;
        dueDate: string;
    }>;
    chartData: {
        attendance: any[];
        payrollTrend: any[];
        departmentHeadcount: any[];
        complianceStatus: any[];
    };
    recentActivity: Array<{
        id: string;
        type: 'checkin' | 'payroll' | 'document' | 'approval';
        description: string;
        timestamp: string;
        user: string;
    }>;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================
const mockDashboardData: DashboardData = {
    totalEmployees: 150,
    saudiEmployees: 45,
    expatEmployees: 105,
    totalPayroll: 2450000,
    complianceAlerts: [
        {
            id: '1',
            type: 'Iqama Expiring',
            severity: 'critical',
            message: 'Ahmed Al-Rashid Iqama expires 20 Feb',
            employee: 'Ahmed Al-Rashid',
            dueDate: '2024-02-20',
        },
        {
            id: '2',
            type: 'Missing IBAN',
            severity: 'high',
            message: 'Mohamed Khalil missing IBAN',
            employee: 'Mohamed Khalil',
            dueDate: '2024-02-22',
        },
        {
            id: '3',
            type: 'GOSI Not Enrolled',
            severity: 'high',
            message: 'Hassan Khan GOSI not enrolled',
            employee: 'Hassan Khan',
            dueDate: '2024-02-18',
        },
    ],
    chartData: {
        attendance: [
            { date: 'Jan 1', present: 145, absent: 5 },
            { date: 'Jan 8', present: 147, absent: 3 },
            { date: 'Jan 15', present: 148, absent: 2 },
            { date: 'Jan 22', present: 146, absent: 4 },
            { date: 'Jan 29', present: 149, absent: 1 },
            { date: 'Feb 5', present: 147, absent: 3 },
            { date: 'Feb 12', present: 150, absent: 0 },
        ],
        payrollTrend: [
            { month: 'Dec', amount: 2400000 },
            { month: 'Jan', amount: 2450000 },
            { month: 'Feb', amount: 2500000 },
            { month: 'Mar', amount: 2480000 },
        ],
        departmentHeadcount: [
            { name: 'Operations', value: 45, fill: '#6366F1' },
            { name: 'Production', value: 52, fill: '#8B5CF6' },
            { name: 'Quality', value: 28, fill: '#EC4899' },
            { name: 'HR & Admin', value: 25, fill: '#F59E0B' },
        ],
        complianceStatus: [
            { name: 'Compliant', value: 140, fill: '#10B981' },
            { name: 'At Risk', value: 8, fill: '#F59E0B' },
            { name: 'Critical', value: 2, fill: '#EF4444' },
        ],
    },
    recentActivity: [
        {
            id: '1',
            type: 'checkin',
            description: 'Ahmed checked in',
            timestamp: '08:15 AM',
            user: 'Ahmed Al-Rashid',
        },
        {
            id: '2',
            type: 'payroll',
            description: 'Payroll processed',
            timestamp: '02:30 PM',
            user: 'System',
        },
        {
            id: '3',
            type: 'document',
            description: 'Mohamed uploaded documents',
            timestamp: '03:45 PM',
            user: 'Mohamed Khalil',
        },
        {
            id: '4',
            type: 'approval',
            description: 'Hassan approved for leave',
            timestamp: 'Yesterday',
            user: 'HR Manager',
        },
    ],
};

// ============================================================================
// ALERT COMPONENT (Nested)
// ============================================================================
interface AlertItemProps {
    alert: DashboardData['complianceAlerts'][0];
}

const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
    const severityConfig = {
        critical: {
            bg: 'bg-red-50',
            border: 'border-red-200 border-l-4 border-l-red-500',
            badge: 'danger' as const,
            icon: '🔴',
        },
        high: {
            bg: 'bg-amber-50',
            border: 'border-amber-200 border-l-4 border-l-amber-500',
            badge: 'warning' as const,
            icon: '🟠',
        },
        medium: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200 border-l-4 border-l-yellow-500',
            badge: 'info' as const,
            icon: '🟡',
        },
        low: {
            bg: 'bg-blue-50',
            border: 'border-blue-200 border-l-4 border-l-blue-500',
            badge: 'info' as const,
            icon: '🔵',
        },
    };

    const config = severityConfig[alert.severity];

    return (
        <div className={`${config.bg} ${config.border} p-4 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group`}>
            <div className="flex items-start gap-4">
                <span className="text-2xl">{config.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{alert.type}</h4>
                        <Badge status={config.badge} label={alert.severity.toUpperCase()} size="sm" />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-600">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">→</button>
            </div>
        </div>
    );
};

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================
interface ActivityItemProps {
    activity: DashboardData['recentActivity'][0];
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
    const activityConfig = {
        checkin: { icon: '📍', color: 'bg-blue-100 text-blue-700' },
        payroll: { icon: '💰', color: 'bg-green-100 text-green-700' },
        document: { icon: '📄', color: 'bg-purple-100 text-purple-700' },
        approval: { icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
    };

    const config = activityConfig[activity.type];

    return (
        <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0">
            <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0 text-lg`}>
                {config.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-600 mt-0.5">{activity.user}</p>
            </div>
            <p className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</p>
        </div>
    );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData(mockDashboardData);
            setLoading(false);
        }, 500);
    }, []);

    if (loading || !data) {
        return (
            <Layout navItems={[]} user={{ name: 'Ahmed Al-Rashid', email: 'ahmed@eman.com' }}>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout navItems={[]} user={{ name: 'Ahmed Al-Rashid', email: 'ahmed@eman.com' }}>
            {/* Page Header */}
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's your HR overview for today."
                breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    label="Total Employees"
                    value={data.totalEmployees}
                    change={{ value: 2, isPositive: true }}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                />
                <KPICard
                    label="Saudi Employees"
                    value={data.saudiEmployees}
                    change={{ value: 0, isPositive: true }}
                    icon={<Users className="w-6 h-6" />}
                    color="green"
                />
                <KPICard
                    label="Expat Employees"
                    value={data.expatEmployees}
                    change={{ value: 2, isPositive: true }}
                    icon={<Users className="w-6 h-6" />}
                    color="orange"
                />
                <KPICard
                    label="Total Payroll (Monthly)"
                    value={`SAR ${(data.totalPayroll / 1000000).toFixed(2)}M`}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="purple"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attendance Trend */}
                    <Card>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                Attendance Trend
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Last 7 weeks overview</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.chartData.attendance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                    }}
                                    cursor={{ stroke: '#6366F1', strokeWidth: 2 }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="present"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Present"
                                    dot={{ fill: '#10B981', r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="absent"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    name="Absent"
                                    dot={{ fill: '#EF4444', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Payroll Trend */}
                    <Card>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600" />
                                Payroll Trend
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">4-month overview</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.chartData.payrollTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value) => `SAR ${(Number(value) / 1000000).toFixed(2)}M`}
                                />
                                <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Right Column - Mini Charts */}
                <div className="space-y-8">
                    {/* Department Distribution */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Headcount by Department</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.chartData.departmentHeadcount}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name} (${value})`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.chartData.departmentHeadcount.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} employees`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Compliance Status */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance Status</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={data.chartData.complianceStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.chartData.complianceStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {data.chartData.complianceStatus.map((status) => (
                                <div key={status.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: status.fill }}
                                        />
                                        <span className="text-gray-700">{status.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{status.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Section - Alerts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compliance Alerts */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    Compliance Alerts
                                </h3>
                            </div>
                            <Badge status="danger" label={`${data.complianceAlerts.length} Critical`} size="md" />
                        </div>
                        <div className="space-y-3">
                            {data.complianceAlerts.map((alert) => (
                                <AlertItem key={alert.id} alert={alert} />
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <Button variant="secondary" size="md" className="w-full">
                                View All Alerts
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                    <div className="space-y-0">
                        {data.recentActivity.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button variant="secondary" size="md" className="w-full">
                            View Timeline
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default DashboardPage;
