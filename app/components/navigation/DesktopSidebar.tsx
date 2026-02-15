'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    CreditCard,
    CalendarDays,
    FileText,
    ChevronLeft,
    ChevronRight,
    Settings,
    HelpCircle
} from 'lucide-react';

const desktopNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Employees', href: '/employees', icon: <Users size={20} /> },
    { name: 'Compliance', href: '/compliance', icon: <ShieldAlert size={20} />, badge: 3 },
    { name: 'Payroll', href: '/payroll', icon: <CreditCard size={20} /> },
    { name: 'Leaves', href: '/leaves', icon: <CalendarDays size={20} /> },
    { name: 'Reports', href: '/reports', icon: <FileText size={20} /> },
];

export const DesktopSidebar = () => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-slate-900 text-slate-400 border-r border-slate-800 transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-72'
                }`}
        >
            {/* Header */}
            <div className={`p-6 border-b border-slate-800/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg leading-none">Eman 360</p>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Bakery HQ</p>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">E</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {desktopNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="font-semibold text-sm">{item.name}</span>}
                            {!isCollapsed && item.badge && (
                                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-slate-900">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50 space-y-2">
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors group">
                    <Settings size={20} className="text-slate-500 group-hover:text-white" />
                    {!isCollapsed && <span className="text-sm font-semibold">Settings</span>}
                </button>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors group"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!isCollapsed && <span className="text-sm font-semibold">Collapse</span>}
                </button>
            </div>
        </aside>
    );
};
