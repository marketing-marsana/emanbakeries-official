'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, NavItem } from './navConfig';
import { motion } from 'framer-motion';
import { Wheat, User, ChevronDown, LogOut } from 'lucide-react';

export const DesktopSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-72 bg-zinc-900/40 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col z-20 sticky top-0 lg:h-screen transition-all duration-300">
            {/* Logo Section */}
            <div className="h-24 flex items-center px-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-amber-500 blur opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 to-orange-600 p-2.5 rounded-xl shadow-lg border-t border-white/20">
                            <Wheat className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <span className="text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                        Eman Bakery
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item: NavItem) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link key={item.name} href={item.link}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group flex items-center gap-4 px-4 py-4 rounded-xl transition-all border duration-200 ${isActive
                                        ? 'bg-white/5 border-white/5 shadow-inner'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border-transparent hover:border-white/5'
                                    }`}
                            >
                                <div className={`transition-all duration-300 ${isActive ? 'text-amber-400 scale-110' : 'group-hover:text-zinc-100'}`}>
                                    {item.icon}
                                </div>
                                <span className={`text-base tracking-tight ${isActive ? 'font-medium text-zinc-100' : 'font-normal'}`}>
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Mini Profile */}
            <div className="p-6 border-t border-white/5">
                <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-full ring-2 ring-zinc-800 bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <User className="text-zinc-400" size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-200">HR Manager</p>
                        <p className="text-xs text-zinc-500">eman@bakery.com</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </button>
            </div>
        </aside>
    );
};
