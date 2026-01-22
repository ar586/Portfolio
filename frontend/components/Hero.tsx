'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Hero() {
    const [bioData, setBioData] = useState<any>(null);

    useEffect(() => {
        api.getBio()
            .then(res => setBioData(res.data))
            .catch(err => console.error('Failed to fetch bio:', err));
    }, []);

    return (
        <section className="min-h-screen flex flex-col justify-center items-center bg-background relative overflow-hidden py-20 px-4 md:px-8">

            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]"></div>
            </div>

            <div className="container max-w-6xl mx-auto relative z-10">

                {/* 1. Name on Top - Visible Solid Color */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 md:mb-20 text-center"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                        <span className="text-white block mb-2 text-lg md:text-2xl font-medium uppercase tracking-widest text-blue-400">Software Engineer</span>
                        <span className="text-white">Aryan Anand</span>
                    </h1>
                </motion.div>

                {/* 2. Main Content: Side-by-Side Layout */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">

                    {/* Left: Circular Picture Frame */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-shrink-0 relative group"
                    >
                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                            {/* Outer Ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/30 animate-[spin_20s_linear_infinite]"></div>

                            {/* Image Container */}
                            <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-surface shadow-2xl ring-4 ring-blue-500/20">
                                <img
                                    src="/me.jpg"
                                    alt="Aryan Anand"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Intro Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex-1 w-full max-w-lg"
                    >
                        <div className="bg-surface/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl hover:bg-surface/60 transition-colors">

                            <div className="flex items-center gap-2 text-blue-400 mb-4 font-mono text-xs uppercase tracking-wide">
                                <MapPin className="w-3 h-3" />
                                <span>Based in India</span>
                            </div>

                            <p className="text-gray-200 text-lg md:text-xl leading-relaxed mb-4 font-light">
                                Hey this is Aryan Anand, a second year student of the CSAI branch at NSUT Dwarka. I love exploring new technologies and building applications.
                            </p>
                            <p className="text-gray-300 text-base md:text-lg italic leading-relaxed mb-8 border-l-2 border-blue-500/50 pl-4">
                                "Persistence and consistency have been the reason of whatever small feats I have achieved."
                            </p>

                            {/* Social Icons */}
                            <div className="flex gap-4 mt-8 pt-6 border-t border-white/5 justify-start">
                                <a href="https://github.com/ar586" target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://linkedin.com" target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="mailto:contact@example.com" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
