'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ShieldAlert, User } from 'lucide-react';
import { motion } from 'framer-motion';

const mobileNavItems = [
    { name: 'Home', href: '/dashboard', icon: <LayoutDashboard size={24} /> },
    { name: 'Staff', href: '/employees', icon: <Users size={24} /> },
    { name: 'Pay', href: '/payroll', icon: <CreditCard size={24} /> },
    { name: 'Alerts', href: '/compliance', icon: <ShieldAlert size={24} /> },
    { name: 'Profile', href: '/profile', icon: <User size={24} /> },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe-area pt-2 px-6 z-50 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
            <ul className="flex justify-between items-center h-16">
                {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href} className="relative">
                            <Link
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400'
                                    }`}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="relative flex items-center justify-center p-1"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabGlow"
                                            className="absolute -inset-1 bg-indigo-500/10 rounded-xl blur-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                    {item.icon}
                                </motion.div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
