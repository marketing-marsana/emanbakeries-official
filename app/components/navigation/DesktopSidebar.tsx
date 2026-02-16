'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, NavItem } from './navConfig';
import { motion } from 'framer-motion';
import { Settings, User } from 'lucide-react';

export const DesktopSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-20 lg:w-72 bg-white flex flex-col justify-between py-8 border-r border-slate-100 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
            {/* Logo Section */}
            <div className="px-0 lg:px-8 flex flex-col items-center lg:items-start gap-2">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                    <span className="text-2xl">🍞</span>
                </div>
                <div className="hidden lg:block mt-4 text-center lg:text-left">
                    <h2 className="text-base font-bold tracking-tight text-slate-800 uppercase">Eman Bakery</h2>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">HR MANAGEMENT</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-2 px-4 lg:px-6 mt-10 overflow-y-auto custom-scrollbar">
                <p className="hidden lg:block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-3">Main Menu</p>

                {navItems.map((item: NavItem) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link key={item.name} href={item.link}>
                            <motion.div
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${isActive
                                        ? 'bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-100'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-100'
                                    }`}
                            >
                                <div className={`transition-colors ${isActive ? 'text-orange-500' : 'group-hover:text-orange-500'}`}>
                                    {item.icon}
                                </div>
                                <span className="hidden lg:block text-sm">{item.name}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Section */}
            <div className="px-0 lg:px-8 flex flex-col items-center lg:items-start gap-4 mt-4">
                <div className="w-full h-px bg-slate-100"></div>
                <Link href="/settings" className="group flex items-center gap-3 w-full text-slate-500 hover:text-orange-600 transition-all">
                    <Settings size={22} />
                    <span className="hidden lg:block text-sm font-medium">Settings</span>
                </Link>
                <div className="flex items-center gap-3 w-full pt-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white">
                            <User className="text-slate-500" size={20} />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-semibold text-slate-800 truncate">HR Manager</p>
                        <p className="text-xs text-slate-400 truncate">eman@bakery.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
