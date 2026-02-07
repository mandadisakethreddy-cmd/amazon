import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative flex flex-col">
            {/* Subtle background pattern or gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-orange-50/30 -z-10" />

            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="container mx-auto px-4 py-8 flex-1 flex flex-col h-screen"
            >
                {children}
            </motion.main>
        </div>
    );
};
