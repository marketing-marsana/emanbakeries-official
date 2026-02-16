'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, NavItem } from '@/app/components/navigation/navConfig';
import { motion } from 'framer-motion';

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 h-20 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <div className="h-full flex items-center justify-around px-2">
                {navItems.map((item: NavItem) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link key={item.name} href={item.link} className="flex-1 flex flex-col items-center justify-center gap-1.5 group">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isActive
                                        ? 'text-orange-500 bg-orange-50'
                                        : 'text-slate-400 group-hover:text-slate-700'
                                    }`}
                            >
                                {item.icon}
                            </motion.div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'
                                }`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
