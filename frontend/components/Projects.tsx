'use client';

import { useEffect, useState } from 'react';
import { Github, ExternalLink } from 'lucide-react';

interface Project {
    project_id: string;
    title: string;
    description: string;
    image_url?: string;
    image_urls?: string[]; // Array of images for collage layouts
    github_link?: string;
    deployed_link?: string;
    tech_stack: string[];
    featured: boolean;
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [tappedProject, setTappedProject] = useState<string | null>(null);

    useEffect(() => {
        setProjects([
            {
                project_id: 'sahayak',
                title: 'Sahayak: Master Your Academic Pursuit',
                description: 'Presenting Sahayak, your one-stop solution for subject-related guidance. We provide unit-wise breakdowns for subjects where we’ve performed well (at least an 8 pointer), curated PYQs, and the best possible resources so you can save time and focus on what actually matters.',
                image_urls: ['/sahayak.jpg', '/sahayak-2.jpg', '/sahayak-3.jpg'],
                deployed_link: 'https://sahayak.devaryan.tech',
                tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Python', 'JWT', 'Bcrypt'],
                featured: true
            },
            {
                project_id: 'dastabbej',
                title: 'Dastabbej: Simplifying Institutional Complexity',
                description: 'Tired of long, confusing college notices? Meet Dastabbej, a platform that turns complex, irrelevant notices into simple, clear explanations that students can actually comprehend and act upon efficiently.',
                image_url: '/dastabbej.jpg',
                deployed_link: 'https://sahayak-testing.onrender.com',
                tech_stack: ['React', 'AI', 'Web'],
                featured: true
            },
            {
                project_id: 'cinematrix',
                title: 'CineMatrix Enters Modern Era',
                description: 'Traditional movie blogs feel dull and outdated. CineMatrix represents a bold step into modern cinematic blogging, powered by advanced agentic workflows and LangGraph architectures.',
                image_url: '/cinematrix.jpg',
                deployed_link: 'https://cinematrix.devaryan.tech',
                tech_stack: ['LangGraph', 'Agentic AI', 'Next.js'],
                featured: true
            },
            {
                project_id: 'portfolio',
                title: 'Interactive Portfolio Launched',
                description: "A comprehensive digital portfolio site functioning as a centralized hub. It features an integrated chatbot to answer visitor queries autonomously and provides continuous updates of everyday engineering progress.",
                image_url: '/portfolio.jpg',
                github_link: 'https://github.com/ar586/Portfolio',
                tech_stack: ['Next.js', 'FastAPI', 'LangChain', 'Qdrant'],
                featured: true
            }
        ]);
        setLoading(false);
    }, []);

    return (
        <section id="projects" className="py-12 md:py-20 border-b-4 border-text-main bg-primary text-text-main">
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center mb-12 border-double-black pb-4 border-b-4 relative">
                    <h2 className="text-4xl md:text-6xl lg:text-[5rem] font-black font-serif uppercase tracking-tighter text-center leading-none">
                        Featured Reports
                    </h2>
                    <p className="mt-4 text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold uppercase text-center border-y border-text-main py-2 inline-block px-12">
                        Recent Developments & Engineering Feats
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 font-serif italic text-xl">
                        Fetching latest dispatches...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {projects.map((project, index) => (
                            <article key={project.project_id} className={`flex flex-col ${index === 0 ? 'md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-12 lg:gap-10 border-b-4 border-text-main pb-12 mb-4' : 'border-t-4 md:border-t-0 md:border-l border-text-main pt-8 md:pt-0 md:pl-8'}`}>

                                {/* Image Placeholder / Treatment */}
                                <div className={`relative border-4 border-text-main p-1.5 shadow-[6px_6px_0px_#000] mb-6 bg-surface ${index === 0 ? 'lg:col-span-8' : ''}`}>
                                    {project.image_urls && project.image_urls.length >= 3 ? (
                                        <div
                                            className="flex flex-col gap-1.5 relative group h-auto md:h-[40rem] cursor-pointer"
                                            onClick={() => setTappedProject(tappedProject === project.project_id ? null : project.project_id)}
                                        >
                                            <div className="overflow-hidden relative h-64 md:h-[65%] border-2 border-text-main w-full">
                                                <img
                                                    src={project.image_urls[0]}
                                                    alt={`${project.title} image 1`}
                                                    className={`w-full h-full object-cover transition-all duration-700 object-top ${tappedProject === project.project_id ? 'grayscale-0 mix-blend-normal' : 'grayscale contrast-125 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal'}`}
                                                />
                                            </div>
                                            <div className="flex gap-1.5 h-40 md:h-[35%] w-full">
                                                <div className="overflow-hidden relative border-2 border-text-main flex-1">
                                                    <img
                                                        src={project.image_urls[1]}
                                                        alt={`${project.title} image 2`}
                                                        className={`w-full h-full object-cover transition-all duration-700 object-top ${tappedProject === project.project_id ? 'grayscale-0 mix-blend-normal' : 'grayscale contrast-125 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal'}`}
                                                    />
                                                </div>
                                                <div className="overflow-hidden relative border-2 border-text-main flex-1">
                                                    <img
                                                        src={project.image_urls[2]}
                                                        alt={`${project.title} image 3`}
                                                        className={`w-full h-full object-cover transition-all duration-700 object-top ${tappedProject === project.project_id ? 'grayscale-0 mix-blend-normal' : 'grayscale contrast-125 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal'}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuNSIgZmlsbD0iIzExMSIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+Cjwvc3ZnPg==')] mix-blend-overlay pointer-events-none transition-opacity duration-700 ${tappedProject === project.project_id ? 'opacity-0' : 'opacity-50 group-hover:opacity-0'}`}></div>
                                        </div>
                                    ) : project.image_url ? (
                                        <div
                                            className="overflow-hidden relative group border-2 border-text-main cursor-pointer"
                                            onClick={() => setTappedProject(tappedProject === project.project_id ? null : project.project_id)}
                                        >
                                            <img
                                                src={project.image_url}
                                                alt={project.title}
                                                className={`w-full object-cover transition-all duration-700 ${index === 0 ? 'h-64 md:h-[26rem]' : 'h-48'} ${tappedProject === project.project_id ? 'grayscale-0 mix-blend-normal' : 'grayscale contrast-125 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal'}`}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            {/* Halftone/Print overlay effect */}
                                            <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuNSIgZmlsbD0iIzExMSIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+Cjwvc3ZnPg==')] mix-blend-overlay pointer-events-none transition-opacity duration-700 ${tappedProject === project.project_id ? 'opacity-0' : 'opacity-50 group-hover:opacity-0'}`}></div>
                                        </div>
                                    ) : (
                                        <div className={`w-full bg-primary border-2 border-text-main flex flex-col items-center justify-center font-serif italic text-accent ${index === 0 ? 'h-64 md:h-[26rem]' : 'h-48'}`}>
                                            <span className="text-4xl mb-2">📸</span>
                                            <span>No Photograph Available</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content portion */}
                                <div className={`flex flex-col ${index === 0 ? 'lg:col-span-4 justify-center' : ''}`}>
                                    <h3 className={`font-serif font-black uppercase leading-[1.05] tracking-tight mb-3 ${index === 0 ? 'text-4xl md:text-5xl lg:text-6xl mb-6' : 'text-3xl'}`}>
                                        {project.title}
                                    </h3>

                                    <div className="border-y border-text-main py-2 mb-4">
                                        <p className="font-serif italic text-xs text-accent">
                                            Architected with: <span className="font-bold text-text-main">{project.tech_stack.join(', ')}</span>
                                        </p>
                                    </div>

                                    <p className={`font-serif text-justify leading-relaxed mb-6 flex-grow ${index === 0 ? 'text-base md:text-lg' : 'text-sm'}`}>
                                        {index === 0 && <span className="drop-cap hidden lg:block"></span>}
                                        {project.description}
                                    </p>

                                    {/* Links */}
                                    <div className="flex gap-6 mt-auto border-t border-text-main border-dashed pt-4">
                                        {project.github_link && (
                                            <a
                                                href={project.github_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 font-bold font-sans text-[10px] tracking-[0.2em] uppercase hover:underline group"
                                            >
                                                <Github className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
                                                <span>Source Record</span>
                                            </a>
                                        )}
                                        {project.deployed_link && (
                                            <a
                                                href={project.deployed_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 font-bold font-sans text-[10px] tracking-[0.2em] uppercase hover:underline flex-row-reverse group"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
                                                <span>Read Full Story</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
