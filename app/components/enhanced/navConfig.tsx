import { LayoutDashboard, Users, FileText, Settings, AlertTriangle, DollarSign, CalendarDays } from 'lucide-react';

export const navItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        name: 'Employees',
        href: '/employees',
        icon: <Users className="w-5 h-5" />,
    },
    {
        name: 'Compliance',
        href: '/compliance',
        icon: <AlertTriangle className="w-5 h-5" />,
        badge: 3,
    },
    {
        name: 'Payroll',
        href: '/payroll',
        icon: <DollarSign className="w-5 h-5" />,
    },
    {
        name: 'Leaves / Vacation',
        href: '/leaves',
        icon: <CalendarDays className="w-5 h-5" />,
    },
    {
        name: 'Reports',
        href: '/reports',
        icon: <FileText className="w-5 h-5" />,
    },
];
