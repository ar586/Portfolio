'use client';

import { motion } from 'framer-motion';
import {
    SiPython, SiJavascript, SiTypescript, SiReact, SiNextdotjs,
    SiNodedotjs, SiPytorch, SiTensorflow, SiMongodb, SiPostgresql,
    SiDocker, SiGit, SiFastapi, SiTailwindcss
} from 'react-icons/si';

const skills = [
    { name: 'Python', icon: SiPython, color: '#3776AB' },
    { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
    { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
    { name: 'React', icon: SiReact, color: '#61DAFB' },
    { name: 'Next.js', icon: SiNextdotjs, color: '#FFFFFF' },
    { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
    { name: 'PyTorch', icon: SiPytorch, color: '#EE4C2C' },
    { name: 'TensorFlow', icon: SiTensorflow, color: '#FF6F00' },
    { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
    { name: 'Docker', icon: SiDocker, color: '#2496ED' },
    { name: 'Git', icon: SiGit, color: '#F05032' },
    { name: 'FastAPI', icon: SiFastapi, color: '#009688' },
    { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
];

export default function Skills() {
    return (
        <section id="skills" className="min-h-screen py-12 md:py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Skills & Technologies
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Tools and technologies I work with
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ scale: 1.1, y: -5 }}
                            className="bg-white/5 p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                            <skill.icon
                                className="w-12 h-12 transition-colors"
                                style={{ color: skill.color }}
                            />
                            <span className="text-white text-sm font-medium text-center">
                                {skill.name}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
