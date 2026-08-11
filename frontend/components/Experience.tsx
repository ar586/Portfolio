'use client';

const experiences = [
    {
        id: 'simplifiiq',
        role: 'Software Engineer Intern',
        company: 'SimplifiIQ',
        date: 'Jun – Jul 2026',
        image_url: '/simplifiiq.jpeg',
        bullets: [
            'Built automated webhook pipelines filtering 15K+ daily JSON payloads into enterprise databases.',
            'Synchronized MS Graph APIs for secure data flow, achieving 99.2% delivery success.',
            'Automated PDF reporting pipelines, reducing document generation time by 85%.'
        ],
        skills: ['Data Pipelines', 'MS Graph API', 'Serverless', 'Python']
    }
];

export default function Experience() {
    return (
        <section id="experience" className="py-12 md:py-16 border-b-[3px] border-text-main bg-primary text-text-main">
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center mb-10 border-double-black pb-4 border-b-4">
                    <h2 className="text-4xl md:text-5xl font-black font-serif uppercase tracking-tight text-center">
                        Heist Experiences
                    </h2>
                    <p className="mt-2 text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold uppercase text-center border-t border-text-main pt-2 inline-block">
                        Professional Engagements & Tactical Operations
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {experiences.map((exp) => (
                        <article key={exp.id} className="border-t-4 border-text-main pt-6 lg:pt-10">
                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                                {/* Left Side: Image */}
                                <div className="lg:w-1/3 flex-shrink-0">
                                    <div className="relative border-4 border-text-main p-1.5 shadow-[6px_6px_0px_#000] bg-surface h-64 md:h-[22rem]">
                                        {exp.image_url ? (
                                            <div className="overflow-hidden relative h-full w-full border-2 border-text-main group">
                                                <img
                                                    src={exp.image_url}
                                                    alt={`${exp.company} internship`}
                                                    className="w-full h-full object-cover grayscale contrast-125 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuNSIgZmlsbD0iIzExMSIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+Cjwvc3ZnPg==')] mix-blend-overlay pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-0"></div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full border-2 border-text-main flex flex-col items-center justify-center font-serif italic text-accent bg-primary text-center px-4">
                                                <span className="text-4xl mb-2">📸</span>
                                                <span>Awaiting Intel Image</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Content */}
                                <div className="lg:w-2/3 flex flex-col justify-center">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
                                        <div>
                                            <h3 className="font-serif font-black uppercase text-3xl md:text-5xl leading-tight tracking-tight mb-2">
                                                {exp.company}
                                            </h3>
                                            <h4 className="font-serif italic text-xl md:text-2xl text-accent">
                                                {exp.role}
                                            </h4>
                                        </div>
                                        <div className="mt-4 md:mt-0 font-sans font-bold text-xs uppercase tracking-[0.2em] md:border-l-2 md:border-text-main md:pl-3">
                                            {exp.date}
                                        </div>
                                    </div>
                                    
                                    <div className="border-y border-text-main py-2 mb-6">
                                        <p className="font-serif italic text-sm text-accent">
                                            Tactical Arsenal: <span className="font-bold text-text-main">{exp.skills.join(', ')}</span>
                                        </p>
                                    </div>

                                    <ul className="list-disc pl-6 space-y-3 font-serif leading-relaxed text-base md:text-lg">
                                        {exp.bullets.map((bullet, idx) => (
                                            <li key={idx} className="pl-1 marker:text-text-main">
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
