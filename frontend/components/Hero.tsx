'use client';

import { Github, Linkedin, Mail, ArrowRight, Terminal } from 'lucide-react';

export default function Hero() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).toUpperCase();

    return (
        <section id="home" className="pt-24 pb-12 px-4 md:px-8 border-b-4 border-text-main relative bg-primary text-text-main overflow-hidden">
            <div className="container max-w-6xl mx-auto">
                {/* Masthead */}
                <div className="text-center mb-6 border-b-[3px] border-text-main pb-6 relative">
                    <h1 className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] font-black font-serif tracking-tighter uppercase mb-2 leading-none">
                        The Daily Developer
                    </h1>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-y-2 border-text-main py-2 uppercase text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] font-sans px-2">
                        <span>New Delhi, India</span>
                        <span className="my-2 sm:my-0">{today}</span>
                        <span>Vol. I No. 1</span>
                    </div>
                </div>

                {/* Main Content Area - Newspaper Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Image and quick stats */}
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-start border-b-2 lg:border-b-0 lg:border-r-2 border-text-main pb-8 lg:pb-0 lg:pr-8">
                        <div className="w-full relative border-2 border-text-main p-1.5 mb-6 bg-surface shadow-[4px_4px_0px_#000] group cursor-crosshair">
                            <img
                                src="/me.jpg"
                                alt="Aryan Anand"
                                className="w-full h-auto aspect-[4/5] object-cover grayscale contrast-125 filter group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700"
                            />
                            <div className="absolute bottom-2 right-2 bg-text-main text-primary px-3 py-1 text-[10px] uppercase font-bold tracking-widest group-hover:bg-primary group-hover:text-text-main group-hover:border-2 group-hover:border-text-main transition-all">
                                Exclusive Profile
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="border border-text-main p-4 text-center bg-surface/50">
                                <h3 className="font-serif font-bold text-2xl mb-2">Aryan Anand</h3>
                                <p className="font-sans text-xs font-bold uppercase tracking-widest border-b border-text-main/30 pb-3 mb-3">Software Engineer</p>
                                <div className="flex items-center justify-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em]">
                                    <Terminal className="w-3 h-3" />
                                    <span>Never Out Of Fight</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 pt-2">
                                <a href="https://github.com/ar586" target="_blank" className="p-2 border border-transparent hover:border-text-main hover:bg-surface transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://www.linkedin.com/in/aryan-anand-4aba06309/" target="_blank" className="p-2 border border-transparent hover:border-text-main hover:bg-surface transition-all">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="mailto:aryansingh252006sep@gmail.com" className="p-2 border border-transparent hover:border-text-main hover:bg-surface transition-all">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Lead Article */}
                    <div className="lg:col-span-8">
                        {/* Headline */}
                        <div className="mb-6 border-b-2 border-text-main pb-6">
                            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold font-serif leading-[1.1] mb-4 uppercase">
                                Local Engineer Rewrites Web Design Paradigms
                            </h2>
                            <h3 className="text-lg md:text-2xl font-serif italic text-accent leading-snug">
                                Sophomore at NSUT brings fresh perspective to Artificial Intelligence and comprehensive full-stack architecture.
                            </h3>
                        </div>

                        {/* Article Text in Columns */}
                        <div className="newspaper-column text-justify text-sm md:text-base leading-relaxed space-y-4 font-serif">
                            <p className="drop-cap">
                                I am a sophomore at Netaji Subhas University of Technology (NSUT), currently pursuing a Bachelor of Technology in Computer Science and Engineering, with a specialized focus on Artificial Intelligence and Machine Learning.
                            </p>
                            <p>
                                With a remarkable knack for problem-solving, I dedicate my time to working on projects that transcend mere academic exercises, aiming instead to make a tangible, positive difference in the technological landscape. My journey through academia and independent research has equipped me with a robust understanding of complex algorithms and modern software architecture.
                            </p>
                            <p>
                                The technological world is evolving at an unprecedented pace, and it requires engineers who are not just competent coders, but visionary thinkers. I approach every codebase as an opportunity to refine efficiency and enhance user experience. My recent foray into classical print-inspired web design demonstrates a commitment to marrying timeless aesthetic principles with cutting-edge front-end frameworks.
                            </p>
                            <p>
                                For those interested in collaboration or reviewing my technical portfolio, comprehensive documentation of my recent architectural feats and application developments are available below. The pursuit of elegant, scalable solutions continues unabated.
                            </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-text-main border-dashed flex justify-center lg:justify-end">
                            <a
                                href="#projects"
                                className="px-6 py-3 border-2 border-text-main font-bold font-sans text-xs tracking-[0.2em] uppercase hover:bg-text-main hover:text-primary transition-all flex items-center gap-2 group"
                            >
                                Read Feature Stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
