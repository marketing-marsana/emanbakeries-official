'use client';

import React from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';

export const TopNav = () => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-3xl font-medium tracking-tight text-white drop-shadow-sm">HR Main Dashboard</h1>
                <p className="text-base text-zinc-400 mt-1 font-light">Overview of company performance and employee stats.</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Search Container */}
                <div className="relative group flex-1 md:flex-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative flex items-center bg-zinc-900/80 backdrop-blur border border-white/10 rounded-lg px-4 py-2.5 w-full md:w-64 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500/50 transition-all shadow-sm">
                        <Search className="w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-sm text-zinc-200 ml-2 w-full placeholder:text-zinc-500"
                        />
                    </div>
                </div>

                {/* Date Reference */}
                <button className="relative hidden sm:flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 text-zinc-300 px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm group">
                    <Calendar className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                    <span className="font-medium whitespace-nowrap">16 FEB 2026</span>
                    <ChevronDown className="w-3 h-3 ml-2 text-zinc-500" />
                </button>
            </div>
        </header>
    );
};
