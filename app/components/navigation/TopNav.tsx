'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';

export const TopNav = () => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Good Morning! Here is what's happening today.</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center bg-white rounded-xl px-4 py-2.5 shadow-sm border border-slate-200/60 w-64 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Search className="text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        className="bg-transparent border-none outline-none text-sm text-slate-600 ml-3 w-full placeholder:text-slate-400 font-medium"
                    />
                </div>

                {/* Notifications */}
                <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200/60 shadow-sm text-slate-600 hover:text-orange-500 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                </button>
            </div>
        </header>
    );
};
