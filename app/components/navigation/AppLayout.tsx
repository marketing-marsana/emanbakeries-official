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
        <div className="flex h-screen overflow-hidden bg-[#F2F4F8]">
            {/* Sidebar Navigation */}
            <div className="z-50">
                <DesktopSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative bg-[#F2F4F8]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
