'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const navLinks = [
    { name: 'Front Page', href: '#home' },
    { name: 'Classifieds', href: '#skills' },
    { name: 'Features', href: '#projects' },
    { name: 'Arts & Leisure', href: '#hobbies' },
    { name: 'Markets', href: '#github' },
    { name: 'Puzzles', href: '#leetcode' },
];

export default function FloatingNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`sticky top-0 w-full z-50 transition-all duration-300 font-sans border-b-4 border-text-main bg-primary ${scrolled ? 'shadow-[0_4px_0px_#111] py-2' : 'py-4'
                }`}
        >
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Brand / Logo */}
                    <div className="hidden md:block font-serif font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
                        The Post
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-x-1 md:gap-x-2 gap-y-2 text-[10px] md:text-xs font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="hover:bg-text-main hover:text-primary px-2 py-1 transition-colors border border-transparent hover:border-text-main"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
