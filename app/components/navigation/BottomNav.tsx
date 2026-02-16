'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, NavItem } from '@/app/components/navigation/navConfig';
import { motion } from 'framer-motion';

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 z-50 h-[calc(4.5rem+env(safe-area-inset-bottom))] pb-safe">
            <div className="h-full flex items-center justify-around px-2">
                {navItems.map((item: NavItem) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link key={item.name} href={item.link} className="flex-1 flex flex-col items-center justify-center gap-1 group">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isActive
                                        ? 'text-amber-400 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                        : 'text-zinc-500 group-hover:text-zinc-300'
                                    }`}
                            >
                                <div className={`${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {item.icon}
                                </div>
                            </motion.div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-zinc-100' : 'text-zinc-500'
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
