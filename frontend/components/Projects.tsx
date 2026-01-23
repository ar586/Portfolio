'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface Project {
    project_id: string;
    title: string;
    description: string;
    image_url?: string;
    github_link?: string;
    deployed_link?: string;
    tech_stack: string[];
    featured: boolean;
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hardcoded projects for now as per user request
        setProjects([
            {
                project_id: 'dastabbej',
                title: 'Dastabbej',
                description: 'Tired of long, confusing college notices? Meet Dastabbej, a platform that turns complex, irrelevant notices into simple, clear explanations you can actually understand. No more scrolling through PDFs or worrying if a notice even applies to your branch or year. Just ask, and Dastabbej tells you what matters to you.',
                image_url: '/dastabbej.jpg',
                deployed_link: 'https://sahayak-testing.onrender.com',
                tech_stack: ['React', 'AI', 'Web'],
                featured: true
            },
            {
                project_id: 'cinematrix',
                title: 'CineMatrix',
                description: 'Traditional movie blogs feel dull and outdated. So I built CineMatrix — a step into modern cinematic blogging, powered by agentic workflows and LangGraph, generating ever-evolving creative insights by capturing the true essence of conversations across multiple relevant platforms. Every visit is a new experience.',
                image_url: '/cinematrix.jpg',
                deployed_link: 'https://cinematrix.devaryan.tech',
                tech_stack: ['LangGraph', 'Agentic AI', 'Next.js'],
                featured: true
            }
        ]);
        setLoading(false);
    }, []);

    return (
        <section id="projects" className="min-h-screen py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Featured Projects
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Some of my recent work
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.project_id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all"
                            >
                                {/* Project Image */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-leetcode/20 flex items-center justify-center overflow-hidden">
                                    {project.image_url ? (
                                        <img
                                            src={project.image_url}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-6xl">💻</div>
                                    )}
                                </div>

                                {/* Project Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-400 mb-4 line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tech_stack.slice(0, 4).map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    <div className="flex gap-4">
                                        {project.github_link && (
                                            <a
                                                href={project.github_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-400 hover:text-github transition-colors"
                                            >
                                                <Github className="w-5 h-5" />
                                                <span>Code</span>
                                            </a>
                                        )}
                                        {project.deployed_link && (
                                            <a
                                                href={project.deployed_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                                <span>Live Demo</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
