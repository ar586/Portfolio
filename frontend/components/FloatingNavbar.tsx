'use client';

import { motion } from 'framer-motion';
import { Code, Book, Gamepad2, Github } from 'lucide-react';
import Link from 'next/link';

const links = [
    { name: 'Skills', icon: Code, href: '#skills', color: 'text-blue-400' },
    { name: 'Hobbies', icon: Book, href: '#hobbies', color: 'text-green-400' },
    { name: 'LeetCode', icon: Code, href: '#leetcode', color: 'text-yellow-400' },
    { name: 'GitHub', icon: Github, href: '#github', color: 'text-purple-400' },
];

export default function FloatingNavbar() {
    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:top-6 md:left-auto md:right-6 z-50 fixed-navbar-container"
        >
            <div className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
                {links.map((link) => (
                    <Link key={link.name} href={link.href}>
                        <motion.div
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-full relative group cursor-pointer"
                        >
                            <link.icon className={`w-5 h-5 ${link.color}`} />

                            {/* Tooltip - positioned below the icon */}
                            <span className="absolute top-[130%] left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {link.name}
                            </span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}
