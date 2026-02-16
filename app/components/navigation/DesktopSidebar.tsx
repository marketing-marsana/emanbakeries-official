'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, NavItem } from '@/app/components/navigation/navConfig';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Box, Terminal } from 'lucide-react';

export const DesktopSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-80 chrome-panel border-r border-black/10 z-[60] overflow-hidden flex flex-col m-1.5 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
            {/* Gloss Header Overlay */}
            <div className="absolute inset-0 bg-white/40 pointer-events-none opacity-20 bg-gradient-to-b from-white to-transparent h-1/2" />

            {/* Header / Logo Section */}
            <div className="relative p-10 pt-12 flex items-center gap-5">
                <div className="w-16 h-16 bg-obsidian rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-40 blur-sm" />
                    <span className="text-white font-black text-3xl tracking-tighter transition-transform group-hover:scale-110">E</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-obsidian tracking-tighter leading-none mb-1">EMAN</span>
                    <span className="text-[10px] font-black text-obsidian/40 uppercase tracking-[0.4em] leading-none mb-1">BAKERY 360</span>
                    <span className="px-2 py-0.5 bg-black/5 text-[9px] font-black text-black/40 rounded-full w-fit mt-2 border border-black/5">GEN-V 3.0</span>
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="relative flex-1 px-4 py-10 space-y-12 overflow-y-auto custom-scrollbar">
                <div>
                    <h3 className="px-6 mb-6 text-[10px] font-black text-obsidian/30 uppercase tracking-[0.4em]">Main Modules</h3>
                    <div className="space-y-2">
                        {navItems.map((item: NavItem) => {
                            const isActive = pathname === item.link;
                            return (
                                <Link key={item.name} href={item.link}>
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`group relative flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 ${isActive
                                            ? 'bg-obsidian text-white shadow-2xl'
                                            : 'text-obsidian/60 hover:text-obsidian hover:bg-white/20'
                                            }`}
                                    >
                                        <div className={`transition-transform duration-500 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`font-black tracking-tight text-sm ${isActive ? 'text-glow-sm' : ''}`}>
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Sub-Actions / System Status */}
                <div>
                    <h3 className="px-6 mb-6 text-[10px] font-black text-obsidian/30 uppercase tracking-[0.4em]">Control Matrix</h3>
                    <div className="grid grid-cols-2 gap-3 px-4">
                        {[
                            { icon: <Shield size={16} />, label: 'Core' },
                            { icon: <Terminal size={16} />, label: 'Nodes' },
                            { icon: <Smartphone size={16} />, label: 'Sync' },
                            { icon: <Box size={16} />, label: 'Data' }
                        ].map((btn, i) => (
                            <button key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/5 hover:bg-black/10 transition-all border border-black/5 gap-2 group">
                                <div className="text-obsidian group-hover:scale-110 transition-transform">{btn.icon}</div>
                                <span className="text-[9px] font-black uppercase text-obsidian/40 tracking-wider font-heading">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Bottom Footer Info */}
            <div className="relative p-10 mt-auto border-t border-black/5 bg-black/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 animate-pulse">
                        <Smartphone size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-obsidian tracking-tight">System Status</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Fully Operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
