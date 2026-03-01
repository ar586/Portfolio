'use client';

import { Github, Linkedin, Mail } from 'lucide-react';

const socialLinks = [
    { name: 'GitHub', icon: Github, url: 'https://github.com/ar586' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/aryan-anand-4aba06309/' },
    { name: 'Email', icon: Mail, url: 'mailto:aryansingh252006sep@gmail.com' },
];

export default function Footer() {
    return (
        <footer className="w-full py-12 border-t-[8px] border-text-main relative z-50 bg-primary font-sans mt-auto">
            <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                <div className="border-4 border-text-main p-4 md:p-8 bg-surface shadow-[6px_6px_0px_#111]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-2 border-text-main border-dashed p-6">

                        {/* Publisher Info */}
                        <div className="text-center md:text-left">
                            <div className="text-[10px] font-bold tracking-[0.3em] uppercase border-b border-text-main pb-2 mb-2 inline-block">
                                The Back Page
                            </div>
                            <h3 className="text-3xl font-black font-serif uppercase tracking-tighter mb-2">
                                The Daily Developer
                            </h3>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase">
                                Published By: Aryan Anand
                            </p>
                            <p className="text-[10px] tracking-[0.2em] uppercase mt-2">
                                © {new Date().getFullYear()} All rights reserved. Registered Edition.
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="flex flex-col items-center md:items-end gap-4">
                            <div className="text-[10px] font-bold tracking-[0.2em] uppercase border-b border-text-main pb-1">
                                Correspond & Connect
                            </div>
                            <div className="flex items-center gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 border-2 border-text-main bg-primary hover:bg-text-main hover:text-primary transition-all shadow-[2px_2px_0px_#111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] group"
                                        title={social.name}
                                    >
                                        <social.icon className="w-5 h-5 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="text-center text-[10px] font-bold tracking-[0.3em] uppercase pt-6 mt-6 border-t-2 border-text-main">
                        Designed & Built for Print & Web
                    </div>
                </div>
            </div>
        </footer>
    );
}
