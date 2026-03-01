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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-4 py-2 border-2 border-text-main bg-primary shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group cursor-pointer"
                >
                    <div className="relative">
                        <MessageSquare className="w-5 h-5 text-text-main" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-text-main opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-text-main"></span>
                        </span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-main hidden md:block">
                        AI Telegram
                    </span>
                </motion.div>
            </Link>
        </motion.div>
    );
}
