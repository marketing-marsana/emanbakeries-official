'use client';

import React from 'react';
import { Bell, Search, User, Settings, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const TopNav = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-black/40 backdrop-blur-2xl border-b border-white/5 z-40 transition-all duration-500">
            <div className="h-full px-8 flex items-center justify-between mx-auto md:pl-[var(--spacing-sidebar)]">
                {/* Branding / System Identity */}
                <div className="flex md:hidden items-center gap-4">
                    <div className="w-10 h-10 chrome-panel rounded-xl flex items-center justify-center">
                        <span className="text-obsidian font-black text-xl">E</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-white tracking-tighter text-glow-sm">EMAN 360</span>
                        <span className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em]">HQ COMMAND</span>
                    </div>
                </div>

                {/* Search - Integrated into the glass panel */}
                <div className="hidden md:flex items-center flex-1 max-w-2xl ml-10">
                    <div className="relative w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-all" size={18} />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-white/5 focus:bg-white/[0.06] transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Control Center Actions */}
                <div className="flex items-center gap-4 md:gap-7 pr-4">
                    <button className="hidden sm:flex p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all relative">
                        <Settings size={20} />
                    </button>

                    <button className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all relative group">
                        <Bell size={22} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full border-2 border-black animate-pulse"></span>
                    </button>

                    <div className="hidden sm:flex items-center gap-4 pl-6 border-l border-white/10 group cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] leading-none mb-1.5">Sector Admin</p>
                            <p className="text-sm font-black text-white tracking-tight text-glow-sm">Shafeeque V.</p>
                        </div>
                        <div className="w-12 h-12 chrome-panel rounded-[1.25rem] flex items-center justify-center text-obsidian font-black shadow-2xl group-hover:scale-105 transition-transform">
                            SV
                        </div>
                    </div>

                    <button className="md:hidden w-10 h-10 chrome-panel rounded-xl flex items-center justify-center text-obsidian shadow-lg">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
