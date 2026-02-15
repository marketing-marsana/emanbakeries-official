'use client';

import React from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-slate-50 overflow-hidden font-inter">
            {/* Desktop Sidebar */}
            <DesktopSidebar />

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:pl-72 lg:pl-72 items-stretch">
                {/* Responsive TopNav */}
                <TopNav />

                {/* Main Content Area */}
                <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0 px-4 md:px-8 max-w-[1600px] w-full mx-auto">
                    <div className="py-6 h-full">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <BottomNav />
            </div>

            {/* Global Overlay Styles */}
            <style jsx global>{`
                .pb-safe-area {
                    padding-bottom: env(safe-area-inset-bottom);
                }
                .pt-safe-area {
                    padding-top: env(safe-area-inset-top);
                }
                @media (max-width: 768px) {
                    main {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};
