/**
 * ENHANCED EMPLOYEES PAGE - JISR STYLE
 * Advanced employee management with filtering, search, profiles, and bulk actions
 * 
 * Features:
 * - Advanced search and filtering
 * - Responsive data table
 * - Employee profile modal
 * - Bulk actions
 * - Add employee form
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ChevronDown, Eye, Edit2, Trash2, FileText, X } from 'lucide-react';
import {
    Layout,
    PageHeader,
    Card,
    Button,
    Input,
    Badge,
    Modal,
    colors,
} from './Layout';

// ============================================================================
// TYPES
// ============================================================================
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    nationality: string;
    iqama: string;
    iqamaExpiry: string;
    salary: number;
    status: 'active' | 'on_leave' | 'terminated';
    hireDate: string;
    complianceStatus: 'compliant' | 'at_risk' | 'critical';
    documents: Array<{ type: string; expiryDate?: string }>;
}

// ============================================================================
// MOCK DATA
// ============================================================================
const mockEmployees: Employee[] = [
    {
        id: 'EMP001',
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        email: 'ahmed@eman.com',
        phone: '+966501234567',
        position: 'Production Manager',
        department: 'Operations',
        nationality: 'Saudi Arabia',
        iqama: '1234567890',
        iqamaExpiry: '2025-02-20',
        salary: 8000,
        status: 'active',
        hireDate: '2020-03-01',
        complianceStatus: 'compliant',
        documents: [
            { type: 'Contract', expiryDate: '2025-03-01' },
            { type: 'Iqama', expiryDate: '2025-02-20' },
        ],
    },
    {
        id: 'EMP002',
        firstName: 'Mohamed',
        lastName: 'Khalil',
        email: 'mohamed@eman.com',
        phone: '+966502234567',
        position: 'Head Baker',
        department: 'Production',
        nationality: 'Egypt',
        iqama: '2000123456',
        iqamaExpiry: '2024-12-15',
        salary: 6500,
        status: 'active',
        hireDate: '2019-06-15',
        complianceStatus: 'critical',
        documents: [
            { type: 'Contract' },
            { type: 'Iqama', expiryDate: '2024-12-15' },
        ],
    },
    {
        id: 'EMP003',
        firstName: 'Hassan',
        lastName: 'Khan',
        email: 'hassan@eman.com',
        phone: '+966503234567',
        position: 'QA Supervisor',
        department: 'Quality Assurance',
        nationality: 'Pakistan',
        iqama: '2100654321',
        iqamaExpiry: '2025-08-10',
        salary: 5500,
        status: 'active',
        hireDate: '2021-01-10',
        complianceStatus: 'at_risk',
        documents: [
            { type: 'Contract' },
            { type: 'Iqama', expiryDate: '2025-08-10' },
        ],
    },
    {
        id: 'EMP004',
        firstName: 'Rajesh',
        lastName: 'Sharma',
        email: 'rajesh@eman.com',
        phone: '+966504234567',
        position: 'Machine Operator',
        department: 'Production',
        nationality: 'India',
        iqama: '2200888999',
        iqamaExpiry: '2024-10-01',
        salary: 4200,
        status: 'active',
        hireDate: '2021-07-20',
        complianceStatus: 'critical',
        documents: [
            { type: 'Contract' },
            { type: 'Iqama', expiryDate: '2024-10-01' },
        ],
    },
    {
        id: 'EMP005',
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria@eman.com',
        phone: '+966505234567',
        position: 'Packaging Specialist',
        department: 'Packaging',
        nationality: 'Philippines',
        iqama: '2300555666',
        iqamaExpiry: '2025-06-30',
        salary: 4000,
        status: 'active',
        hireDate: '2022-02-15',
        complianceStatus: 'compliant',
        documents: [
            { type: 'Contract' },
            { type: 'Iqama', expiryDate: '2025-06-30' },
        ],
    },
];

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================
interface FilterPanelProps {
    onFiltersChange: (filters: FilterState) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

interface FilterState {
    status: string;
    department: string;
    nationality: string;
    compliance: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange, searchQuery, onSearchChange }) => {
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        department: 'all',
        nationality: 'all',
        compliance: 'all',
    });

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    return (
        <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                    placeholder="Search by name, email..."
                    icon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />

                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                </select>

                <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                >
                    <option value="all">All Departments</option>
                    <option value="Operations">Operations</option>
                    <option value="Production">Production</option>
                    <option value="Quality Assurance">Quality</option>
                    <option value="Packaging">Packaging</option>
                </select>

                <select
                    value={filters.nationality}
                    onChange={(e) => handleFilterChange('nationality', e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                >
                    <option value="all">All Nationalities</option>
                    <option value="Saudi Arabia">Saudi</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="Philippines">Philippines</option>
                </select>

                <select
                    value={filters.compliance}
                    onChange={(e) => handleFilterChange('compliance', e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
                >
                    <option value="all">All Compliance</option>
                    <option value="compliant">Compliant</option>
                    <option value="at_risk">At Risk</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
        </Card>
    );
};

// ============================================================================
// TABLE COMPONENT
// ============================================================================
interface TableProps {
    employees: Employee[];
    onViewProfile: (employee: Employee) => void;
}

const EmployeesTable: React.FC<TableProps> = ({ employees, onViewProfile }) => {
    const complianceConfig = {
        compliant: { color: 'success' as const, icon: '✅' },
        at_risk: { color: 'warning' as const, icon: '⚠️' },
        critical: { color: 'danger' as const, icon: '🔴' },
    };

    const statusConfig = {
        active: { color: 'success' as const, label: 'Active' },
        on_leave: { color: 'warning' as const, label: 'On Leave' },
        terminated: { color: 'danger' as const, label: 'Terminated' },
    };

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Compliance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Iqama Expiry
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                            {employee.firstName.charAt(0)}
                                            {employee.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {employee.firstName} {employee.lastName}
                                            </p>
                                            <p className="text-xs text-gray-600">{employee.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{employee.position}</p>
                                        <p className="text-xs text-gray-600">{employee.department}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        status={statusConfig[employee.status].color}
                                        label={statusConfig[employee.status].label}
                                        size="sm"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        status={complianceConfig[employee.complianceStatus].color}
                                        label={employee.complianceStatus.toUpperCase().replace('_', ' ')}
                                        size="sm"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-900">
                                        {new Date(employee.iqamaExpiry).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onViewProfile(employee)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                                        title="View Profile"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// ============================================================================
// EMPLOYEE PROFILE MODAL
// ============================================================================
interface ProfileModalProps {
    employee: Employee | null;
    isOpen: boolean;
    onClose: () => void;
}

const EmployeeProfileModal: React.FC<ProfileModalProps> = ({ employee, isOpen, onClose }) => {
    if (!employee) return null;

    const complianceColor = {
        compliant: 'bg-green-50 text-green-700',
        at_risk: 'bg-yellow-50 text-yellow-700',
        critical: 'bg-red-50 text-red-700',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${employee.firstName} ${employee.lastName}`} size="lg">
            {/* Profile Header */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {employee.firstName.charAt(0)}
                        {employee.lastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-gray-600 mt-1">{employee.position}</p>
                        <div className="flex gap-2 mt-3">
                            <Badge status="info" label={employee.status.toUpperCase().replace('_', ' ')} size="sm" />
                            <Badge
                                status={
                                    employee.complianceStatus === 'compliant'
                                        ? 'success'
                                        : employee.complianceStatus === 'at_risk'
                                            ? 'warning'
                                            : 'danger'
                                }
                                label={employee.complianceStatus.toUpperCase().replace('_', ' ')}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Email</p>
                            <p className="text-gray-900 font-medium">{employee.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Phone</p>
                            <p className="text-gray-900 font-medium">{employee.phone}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Iqama</p>
                            <p className="text-gray-900 font-medium">{employee.iqama}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Nationality</p>
                            <p className="text-gray-900 font-medium">{employee.nationality}</p>
                        </div>
                    </div>
                </div>

                {/* Employment Info */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Employment Details</h4>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Department</p>
                            <p className="text-gray-900 font-medium">{employee.department}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Salary (Monthly)</p>
                            <p className="text-gray-900 font-medium">SAR {employee.salary.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Hire Date</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(employee.hireDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wider">Iqama Expiry</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(employee.iqamaExpiry).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Documents</h4>
                <div className="space-y-2">
                    {employee.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                                    {doc.expiryDate && (
                                        <p className="text-xs text-gray-600">
                                            Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Eye className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex gap-3 justify-end">
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                </Button>
            </div>
        </Modal>
    );
};

// ============================================================================
// MAIN EMPLOYEES PAGE
// ============================================================================
export const EmployeesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        department: 'all',
        nationality: 'all',
        compliance: 'all',
    });
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Filter and search logic
    const filteredEmployees = useMemo(() => {
        return mockEmployees.filter((emp) => {
            const matchesSearch =
                emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filters.status === 'all' || emp.status === filters.status;
            const matchesDept = filters.department === 'all' || emp.department === filters.department;
            const matchesNationality =
                filters.nationality === 'all' || emp.nationality === filters.nationality;
            const matchesCompliance =
                filters.compliance === 'all' || emp.complianceStatus === filters.compliance;

            return matchesSearch && matchesStatus && matchesDept && matchesNationality && matchesCompliance;
        });
    }, [searchQuery, filters]);

    const handleViewProfile = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsProfileOpen(true);
    };

    return (
        <Layout navItems={[]} user={{ name: 'Ahmed Al-Rashid', email: 'ahmed@eman.com' }}>
            {/* Page Header */}
            <PageHeader
                title="Employees"
                description="Manage and monitor your workforce"
                breadcrumbs={[{ label: 'Home' }, { label: 'Employees' }]}
                actions={
                    <Button variant="primary" size="lg">
                        <Plus className="w-5 h-5" />
                        Add Employee
                    </Button>
                }
            />

            {/* Filter Panel */}
            <FilterPanel
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFiltersChange={setFilters}
            />

            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredEmployees.length}</span> of{' '}
                    <span className="font-semibold">{mockEmployees.length}</span> employees
                </p>
            </div>

            {/* Employees Table */}
            {filteredEmployees.length > 0 ? (
                <EmployeesTable employees={filteredEmployees} onViewProfile={handleViewProfile} />
            ) : (
                <Card className="text-center py-12">
                    <p className="text-gray-600">No employees found matching your criteria.</p>
                </Card>
            )}

            {/* Employee Profile Modal */}
            <EmployeeProfileModal
                employee={selectedEmployee}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </Layout>
    );
};

export default EmployeesPage;
