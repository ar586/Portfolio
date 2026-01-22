'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function FloatingChatbot() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="fixed top-6 left-6 z-50"
        >
            <Link href="/chat">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-colors group cursor-pointer"
                >
                    <div className="relative">
                        <MessageSquare className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                    </div>
                    <span className="text-sm font-medium text-white/90 group-hover:text-white hidden md:block">
                        AI Assistant
                    </span>
                </motion.div>
            </Link>
        </motion.div>
    );
}
