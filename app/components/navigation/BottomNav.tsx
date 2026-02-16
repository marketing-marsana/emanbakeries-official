'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, NavItem } from '@/app/components/navigation/navConfig';
import { motion, AnimatePresence } from 'framer-motion';

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(5rem+env(safe-area-inset-bottom))] bg-obsidian border-t border-white/5 z-50 overflow-hidden">
            {/* Gloss Header Overlay */}
            <div className="absolute inset-x-0 bottom-0 top-0 bg-white/[0.02] pointer-events-none" />

            {/* Navigation Grid */}
            <div className="h-full flex items-center justify-around px-2 pb-safe-area relative z-10">
                {navItems.map((item: NavItem) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link key={item.name} href={item.link} className="flex-1 max-w-[80px]">
                            <div className="relative flex flex-col items-center justify-center gap-1.5 py-2 group">
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    className={`p-2.5 rounded-2xl transition-all duration-300 relative ${isActive
                                        ? 'bg-white text-obsidian shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                                        : 'text-white/40 group-hover:text-white/80'
                                        }`}
                                >
                                    <div className={`transition-transform duration-500 scale-110 ${isActive ? 'rotate-0' : 'opacity-80'}`}>
                                        {item.icon}
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="mobileActiveSpot"
                                            className="absolute -inset-1 border border-white/20 rounded-[1.25rem] pointer-events-none"
                                        />
                                    )}
                                </motion.div>
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-white text-glow-sm scale-110' : 'text-white/20'
                                    }`}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Micro Indicator Strip */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full mt-1.5" />
        </nav>
    );
};
