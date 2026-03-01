'use client';

import { Code, Book, Guitar, Utensils } from 'lucide-react';

const hobbies = [
    {
        name: 'Algorithms', // Renamed slightly to fit newspaper tone better
        shortDescription: 'The Architecture of Logic',
        longDescription: "As someone who didn't have the opportunity to use a computer until I cracked JEE, it took me a bit of time to get the hang of it, but I think I am in the right motion now. Logic and structure have become second nature, turning coding from a necessity into a profound passion for building and solving.",
        icon: Code
    },
    {
        name: 'Literature',
        shortDescription: 'Fiction & Historical Accounts',
        longDescription: "Starting from Champak and Magic Pot to The Kite Runner and 1984, reading has been a generous teacher and supporter of mine. Khaled Hosseini and Stephen King remain pivotal figures informing my worldview and serving as an endless reservoir of inspiration and empathy.",
        icon: Book
    },
    {
        name: 'Acoustics',
        shortDescription: 'Six Strings & Melodies',
        longDescription: "After frustrating days of rigorous academic pursuit, I find profound solace in strings. The calming effect the acoustic guitar has had on me has been well worth all the pain it initially caused to my uncalloused fingers, transforming noise into harmony.",
        icon: Guitar
    },
    {
        name: 'Culinary Arts',
        shortDescription: 'Gastronomic Experiments',
        longDescription: "This pursuit proved deeply surprising. I never anticipated enjoying the culinary arts this much, but the pandemic restricting market access, combined with a profound appreciation for good food, led it to become one of my most favored daily rituals.",
        icon: Utensils
    }
];

export default function Hobbies() {
    return (
        <section id="hobbies" className="py-12 md:py-20 border-b-4 border-text-main bg-primary text-text-main">
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                {/* Section Header */}
                <div className="flex flex-col items-center mb-12 border-b-2 border-text-main pb-4">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif uppercase tracking-tight text-center">
                        Arts & Leisure
                    </h2>
                    <p className="mt-2 text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold uppercase text-center border-t border-text-main pt-2 inline-block px-8">
                        Personal Pursuits & Diversions
                    </p>
                </div>

                {/* Newspaper Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
                    {hobbies.map((hobby, index) => (
                        <article key={hobby.name} className={`flex flex-col ${index !== hobbies.length - 1 ? 'border-b-2 lg:border-b-0 lg:border-r-2 border-text-main pb-8 lg:pb-0 lg:pr-8' : ''} ${index !== 0 ? 'lg:pl-8' : ''}`}>

                            <div className="flex items-center gap-3 mb-4">
                                <hobby.icon className="w-8 h-8 border-[1.5px] border-text-main p-1.5 shadow-[2px_2px_0px_#111] bg-surface flex-shrink-0" />
                                <h3 className="font-serif font-black text-2xl uppercase leading-[1.1]">
                                    {hobby.name}
                                </h3>
                            </div>

                            <h4 className="font-serif italic text-sm mb-4 border-y border-text-main py-2 bg-surface/30 px-2 text-center">
                                {hobby.shortDescription}
                            </h4>

                            <div className="font-serif text-justify text-sm leading-relaxed">
                                <span className="drop-cap">{hobby.longDescription.charAt(0)}</span>
                                {hobby.longDescription.slice(1)}
                            </div>

                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
