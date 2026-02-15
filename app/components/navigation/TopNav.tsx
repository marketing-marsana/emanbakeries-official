'use client';

import React from 'react';
import { Bell, Search, Globe, User, Menu } from 'lucide-react';

export const TopNav = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 transition-all duration-300">
            <div className="h-full px-6 flex items-center justify-between mx-auto">
                {/* Mobile Logo / Branding */}
                <div className="flex md:hidden items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <span className="font-bold text-slate-900">Eman 360</span>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:flex items-center flex-1 max-w-xl">
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search employees, files, or reports..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-5">
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Administrator</p>
                            <p className="text-sm font-bold text-slate-900 leading-none">Shafeeque V.</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                            SV
                        </div>
                    </div>

                    {/* Mobile Menu Trigger (Optional if tabs are enough) */}
                    <button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
