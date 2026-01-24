'use client';

import { motion } from 'framer-motion';
import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
    const socialLinks = [
        {
            name: 'GitHub',
            icon: FaGithub,
            url: 'https://github.com/ar586',
            color: 'hover:text-white'
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedin,
            url: 'https://www.linkedin.com/in/aryan-anand-4aba06309/',
            color: 'hover:text-blue-400'
        },
        {
            name: 'Instagram',
            icon: FaInstagram,
            url: 'https://www.instagram.com/aryansingh4600/',
            color: 'hover:text-pink-400'
        },
        {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            url: 'https://wa.me/919776394403',
            color: 'hover:text-green-400'
        }
    ];

    return (
        <footer className="w-full py-8 border-t border-white/5 relative z-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Copyright / Brand */}
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Aryan Anand
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-6">
                        {socialLinks.map((social) => (
                            <motion.a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className={`text-2xl text-gray-400 transition-colors ${social.color}`}
                                title={social.name}
                            >
                                <social.icon />
                            </motion.a>
                        ))}
                    </div>

                    {/* Made with Love tag */}
                    <div className="text-xs text-gray-500 font-mono">
                        Designed & Built with <span className="text-red-500 animate-pulse">❤</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
