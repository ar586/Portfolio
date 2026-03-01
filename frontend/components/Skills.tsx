'use client';

import {
    SiPython, SiJavascript, SiTypescript, SiReact, SiNextdotjs,
    SiNodedotjs, SiPytorch, SiTensorflow, SiMongodb, SiPostgresql,
    SiDocker, SiGit, SiFastapi, SiTailwindcss
} from 'react-icons/si';

const skillsData = [
    {
        category: "Programming Languages",
        items: [
            { name: 'Python', icon: SiPython },
            { name: 'JavaScript', icon: SiJavascript },
            { name: 'TypeScript', icon: SiTypescript },
        ]
    },
    {
        category: "Frameworks & Libraries",
        items: [
            { name: 'React', icon: SiReact },
            { name: 'Next.js', icon: SiNextdotjs },
            { name: 'Node.js', icon: SiNodedotjs },
            { name: 'FastAPI', icon: SiFastapi },
            { name: 'Tailwind CSS', icon: SiTailwindcss },
        ]
    },
    {
        category: "AI & Machine Learning",
        items: [
            { name: 'PyTorch', icon: SiPytorch },
            { name: 'TensorFlow', icon: SiTensorflow },
        ]
    },
    {
        category: "Databases & Systems",
        items: [
            { name: 'MongoDB', icon: SiMongodb },
            { name: 'PostgreSQL', icon: SiPostgresql },
        ]
    },
    {
        category: "DevOps & Tools",
        items: [
            { name: 'Docker', icon: SiDocker },
            { name: 'Git', icon: SiGit },
        ]
    }
];

export default function Skills() {
    return (
        <section id="skills" className="py-12 md:py-16 border-b-[3px] border-text-main bg-primary text-text-main">
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center mb-10 border-double-black pb-4 border-b-4">
                    <h2 className="text-4xl md:text-5xl font-black font-serif uppercase tracking-tight text-center">
                        Technical Classifieds
                    </h2>
                    <p className="mt-2 text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold uppercase text-center border-t border-text-main pt-2 inline-block">
                        Verified Proficiencies & Instruments
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {skillsData.map((category) => (
                        <div key={category.category} className="border-2 border-text-main h-full flex flex-col bg-surface shadow-[4px_4px_0px_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] transition-all duration-200">
                            <div className="bg-text-main text-primary p-2 border-b-2 border-text-main flex items-center justify-center min-h-[3rem]">
                                <h3 className="font-serif font-bold text-sm md:text-base leading-tight uppercase text-center">
                                    {category.category}
                                </h3>
                            </div>
                            <div className="p-4 flex-grow bg-primary">
                                <ul className="space-y-4 font-sans">
                                    {category.items.map((skill) => (
                                        <li key={skill.name} className="flex items-center gap-3 border-b border-text-main/20 pb-3 last:border-0 last:pb-0 group cursor-crosshair">
                                            <skill.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold uppercase tracking-widest leading-none">{skill.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
