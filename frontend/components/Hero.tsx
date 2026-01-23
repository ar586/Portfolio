'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, FileText, ArrowRight, Terminal } from 'lucide-react';

export default function Hero() {
    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

                        {/* Profile Image (Left) */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="relative flex-shrink-0"
                        >
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full p-2 border border-white/10 bg-white/5 backdrop-blur-sm relative z-10">
                                <img
                                    src="/me.jpg"
                                    alt="Aryan Anand"
                                    className="w-full h-full rounded-full object-cover shadow-lg"
                                />
                            </div>
                            {/* Decorative Orbit */}
                            <div className="absolute inset-0 border border-dashed border-blue-400/30 rounded-full animate-[spin_20s_linear_infinite] scale-110 pointer-events-none"></div>
                        </motion.div>

                        {/* Content (Right) */}
                        <div className="text-center md:text-left flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono mb-4"
                            >
                                <Terminal className="w-4 h-4" />
                                <span>Hello World</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-6xl font-bold text-white mb-2"
                            >
                                Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Aryan Anand</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl md:text-2xl text-gray-400 font-light mb-6"
                            >
                                Software Engineer & <br className="md:hidden" /> Creative Developer
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0"
                            >
                                I build accessible, pixel-perfect, and performant web experiences.
                                Currently strictly focusing on mastering full-stack development and system design.
                            </motion.p>

                            {/* Actions & Socials */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="flex gap-4">
                                    <a
                                        href="#projects"
                                        className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                                    >
                                        View Projects <ArrowRight className="w-4 h-4" />
                                    </a>
                                    <a
                                        href="/resume.pdf"
                                        target="_blank"
                                        className="px-6 py-3 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" /> Resume
                                    </a>
                                </div>

                                <div className="h-px w-full md:w-px md:h-12 bg-white/10"></div>

                                <div className="flex gap-4">
                                    <a href="https://github.com/ar586" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                        <Github className="w-6 h-6" />
                                    </a>
                                    <a href="https://www.linkedin.com/in/aryan-anand-4aba06309/" target="_blank" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <Linkedin className="w-6 h-6" />
                                    </a>
                                    <a href="mailto:aryansingh252006sep@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                                        <Mail className="w-6 h-6" />
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
