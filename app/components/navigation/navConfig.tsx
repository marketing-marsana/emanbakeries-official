import { LayoutDashboard, Users, FileText, Settings, AlertTriangle, DollarSign, CalendarDays, LucideIcon } from 'lucide-react';

export interface NavItem {
    name: string;
    link: string;
    icon: React.ReactNode;
    badge?: number;
}

export const navItems: NavItem[] = [
    {
        name: 'Dashboard',
        link: '/dashboard',
        icon: <LayoutDashboard size={20} />,
    },
    {
        name: 'Employees',
        link: '/employees',
        icon: <Users size={20} />,
    },
    {
        name: 'Compliance',
        link: '/compliance',
        icon: <AlertTriangle size={20} />,
        badge: 3,
    },
    {
        name: 'Payroll',
        link: '/payroll',
        icon: <DollarSign size={20} />,
    },
    {
        name: 'Leaves',
        link: '/leaves',
        icon: <CalendarDays size={20} />,
    },
    {
        name: 'Reports',
        link: '/reports',
        icon: <FileText size={20} />,
    },
];
