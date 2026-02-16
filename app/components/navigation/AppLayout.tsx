'use client';

import React from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 overflow-x-hidden">

            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-orange-900/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Sidebar Navigation */}
            <div className="z-50">
                <DesktopSidebar />
            </div>

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10">
                {/* Main Content Area */}
                <main className="flex-1 lg:p-10 p-6 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Mobile Bottom Navigation */}
                <BottomNav />
            </div>

            <style jsx global>{`
                /* Prevent safe area issues on mobile */
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
        </div>
    );
};
