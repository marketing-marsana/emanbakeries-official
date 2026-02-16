'use client';

import React, { useState } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-obsidian overflow-hidden font-sans selection:bg-white/30">
            {/* Background Groove Texture */}
            <div className="fixed inset-0 groove-overlay pointer-events-none opacity-20 z-0" />

            {/* 3D Depth Spotlight */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Desktop Sidebar (Chrome/Silver Style) */}
            <div className="hidden md:block z-50">
                <DesktopSidebar />
            </div>

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-500 md:pl-72 items-stretch relative z-10">
                {/* Responsive TopNav (Obsidian Glass) */}
                <TopNav />

                {/* Main Content Area with 3D Transitions */}
                <main className="flex-1 pt-20 pb-24 md:pb-8 px-4 md:px-10 max-w-[1700px] w-full mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1], // Custom cinematic easing
                            }}
                            className="py-6 h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Mobile Bottom Navigation (Glassmorphic) */}
                <BottomNav />
            </div>

            {/* Global Overlay & Utility Styles */}
            <style jsx global>{`
                .pb-safe-area {
                    padding-bottom: env(safe-area-inset-bottom);
                }
                .pt-safe-area {
                    padding-top: env(safe-area-inset-top);
                }
                
                /* Premium Scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                @media (max-width: 768px) {
                    main {
                        padding-left: 1.25rem;
                        padding-right: 1.25rem;
                    }
                }

                /* Text Shadows for Glow Effects */
                .text-glow-sm { text-shadow: 0 0 8px rgba(255,255,255,0.2); }
                .text-glow-md { text-shadow: 0 0 15px rgba(255,255,255,0.4); }
            `}</style>
        </div>
    );
};
