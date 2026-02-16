'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '../components/navigation/AppLayout';
import {
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Shield,
    TrendingDown,
    TrendingUp,
    Filter,
    Search,
    Download,
    MoreVertical,
    X,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
    const [filterType, setFilterType] = useState<string>('All');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

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

            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('id, full_name_en, nationality, position, created_at')
                .eq('status', 'Active');

            if (empError) throw empError;

            const empIds = employees.map(e => e.id);

            const { data: compliance } = await supabase
                .from('employee_compliance')
                .select('*')
                .in('employee_id', empIds);

            const { data: financials } = await supabase
                .from('employee_financials')
                .select('*')
                .in('employee_id', empIds);

            const { data: snapshots } = await supabase
                .from('portal_data_snapshots')
                .select('employee_id, portal_source')
                .in('employee_id', empIds);

            const generatedAlerts: ComplianceAlert[] = [];
            const today = new Date();
            const warningWindow30 = new Date();
            warningWindow30.setDate(today.getDate() + 30);
            const warningWindow60 = new Date();
            warningWindow60.setDate(today.getDate() + 60);

            employees.forEach(emp => {
                const empComp = compliance?.find(c => c.employee_id === emp.id);
                const empFin = financials?.find(f => f.employee_id === emp.id);
                const isSaudi = emp.nationality?.toLowerCase().includes('saudi') || emp.nationality?.toLowerCase() === 'ksa';
                const sources = snapshots?.filter(s => s.employee_id === emp.id).map(s => s.portal_source) || [];

                if (isSaudi && !sources.includes('GOSI')) {
                    generatedAlerts.push({
                        id: `disc-gosi-${emp.id}`,
                        employeeId: emp.id,
                        employeeName: emp.full_name_en,
                        type: 'High',
                        category: 'Discrepancy',
                        title: 'Missing GOSI Data',
                        description: `Saudi national ${emp.full_name_en} is missing GOSI portal data`,
                        status: 'Open'
                    });
                }

                if (!isSaudi && !sources.includes('MUQEEM')) {
                    generatedAlerts.push({
                        id: `disc-muqeem-${emp.id}`,
                        employeeId: emp.id,
                        employeeName: emp.full_name_en,
                        type: 'Critical',
                        category: 'Discrepancy',
                        title: 'Missing Muqeem Data',
                        description: `Non-Saudi employee ${emp.full_name_en} is missing Muqeem portal data`,
                        status: 'Open'
                    });
                }

                if (empComp?.iqama_expiry) {
                    const expiryDate = new Date(empComp.iqama_expiry);
                    if (expiryDate < today) {
                        generatedAlerts.push({
                            id: `iqama-exp-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'Critical',
                            category: 'Iqama',
                            title: 'Iqama Expired',
                            description: `Iqama expired on ${expiryDate.toLocaleDateString()}`,
                            dueDate: empComp.iqama_expiry,
                            status: 'Open'
                        });
                    } else if (expiryDate < warningWindow30) {
                        generatedAlerts.push({
                            id: `iqama-warn30-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'High',
                            category: 'Iqama',
                            title: 'Iqama Expiring Soon (30 days)',
                            description: `Iqama expires on ${expiryDate.toLocaleDateString()}`,
                            dueDate: empComp.iqama_expiry,
                            status: 'Open'
                        });
                    }
                }

                if (empComp?.passport_expiry) {
                    const passportExpiry = new Date(empComp.passport_expiry);
                    if (passportExpiry < warningWindow60) {
                        generatedAlerts.push({
                            id: `passport-warn-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.full_name_en,
                            type: 'Medium',
                            category: 'Passport',
                            title: 'Passport Expiring Soon (60 days)',
                            description: `Passport expires on ${passportExpiry.toLocaleDateString()}`,
                            dueDate: empComp.passport_expiry,
                            status: 'Open'
                        });
                    }
                }
            });

            setAlerts(generatedAlerts);

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
            console.error('Error fetching compliance data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (type: string) => {
        switch (type) {
            case 'Critical': return 'bg-red-100 text-red-600 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'Medium': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'Low': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getSeverityIcon = (type: string) => {
        switch (type) {
            case 'Critical': return <AlertTriangle size={16} />;
            case 'High': return <AlertCircle size={16} />;
            case 'Medium': return <Clock size={16} />;
            case 'Low': return <FileText size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesType = filterType === 'All' || alert.type === filterType;
        const matchesCategory = filterCategory === 'All' || alert.category === filterCategory;
        const matchesSearch = alert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesCategory && matchesSearch;
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compliance Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Monitor and manage {alerts.length} compliance alerts
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={18} />
                        Export Report
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
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <AlertTriangle size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Critical</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.critical}</h3>
                            <p className="text-sm font-medium text-slate-500">Requires Immediate Action</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">High</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.high}</h3>
                            <p className="text-sm font-medium text-slate-500">High Priority Items</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Clock size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Medium</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.medium}</h3>
                            <p className="text-sm font-medium text-slate-500">Moderate Priority</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Low</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stats.low}</h3>
                            <p className="text-sm font-medium text-slate-500">Low Priority Items</p>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-full lg:w-96 border border-slate-200/60 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                                <Search className="text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search alerts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-slate-600 ml-3 w-full placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            <div className="flex gap-3">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <option value="All">All Severities</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>

                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Iqama">Iqama</option>
                                    <option value="Passport">Passport</option>
                                    <option value="GOSI">GOSI</option>
                                    <option value="Financial">Financial</option>
                                    <option value="Discrepancy">Discrepancy</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Alerts List */}
                    <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">Compliance Alerts</h2>
                            <p className="text-sm text-slate-500 mt-1">Showing {filteredAlerts.length} of {alerts.length} alerts</p>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredAlerts.length > 0 ? filteredAlerts.map((alert, index) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => setSelectedAlert(alert)}
                                    className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getSeverityColor(alert.type)}`}>
                                            {getSeverityIcon(alert.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                                                        {alert.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1">{alert.employeeName}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getSeverityColor(alert.type)}`}>
                                                        {alert.type}
                                                    </span>
                                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                                                        {alert.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600">{alert.description}</p>
                                            {alert.dueDate && (
                                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                                    <Calendar size={14} />
                                                    Due: {new Date(alert.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-12 text-center">
                                    <Shield className="mx-auto text-slate-300 mb-4" size={48} />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No alerts found</h3>
                                    <p className="text-sm text-slate-400">All compliance checks are passing or adjust your filters</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Alert Detail Modal */}
            <AnimatePresence>
                {selectedAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedAlert(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getSeverityColor(selectedAlert.type)}`}>
                                        {getSeverityIcon(selectedAlert.type)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{selectedAlert.title}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{selectedAlert.employeeName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAlert(null)}
                                    className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <X size={20} className="text-slate-600" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex gap-3">
                                    <span className={`text-sm font-bold px-4 py-2 rounded-full border ${getSeverityColor(selectedAlert.type)}`}>
                                        {selectedAlert.type} Priority
                                    </span>
                                    <span className="text-sm font-semibold px-4 py-2 rounded-full bg-slate-100 text-slate-700">
                                        {selectedAlert.category}
                                    </span>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Description</h3>
                                    <p className="text-sm text-slate-600">{selectedAlert.description}</p>
                                </div>

                                {selectedAlert.dueDate && (
                                    <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar size={16} className="text-orange-600" />
                                            <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider">Due Date</h3>
                                        </div>
                                        <p className="text-base font-semibold text-orange-800">
                                            {new Date(selectedAlert.dueDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                                        Mark as Resolved
                                    </button>
                                    <button className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                                        View Employee
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
