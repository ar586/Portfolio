'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Book, Guitar, Utensils } from 'lucide-react';
import Image from 'next/image';

const hobbies = [
    {
        name: 'Coding',
        shortDescription: 'Building projects and solving problems',
        longDescription: "As someone who didnt have opportunity to use a computer till i cracked jee, it took me a bit of time to get the hang of it but i think i am in the right motion now.",
        icon: Code,
        color: 'from-blue-500 to-cyan-500',
        image: '/hobby-coding.jpg' // Placeholder
    },
    {
        name: 'Reading',
        shortDescription: 'Horror,Thriller,Sci-Fi',
        longDescription: "Starting from Champak, Magic Pot to Kite Runner and 1984, reading has been a generous teacher and supporter of mine. Khaled Hosseini and Stephen King are some of my favourite authors.",
        icon: Book,
        color: 'from-green-500 to-emerald-500',
        image: '/hobby-reading.jpg?v=2'
    },
    {
        name: 'Guitar Playing',
        shortDescription: 'Strumming chords and trying to sound like kk',
        longDescription: "After frustating days at college i find solace in strings. The calming effect guitar has had on me has been worth all the pain it has caused to my fingers.",
        icon: Guitar,
        color: 'from-purple-500 to-pink-500',
        image: '/hobby-guitar.jpg'
    },
    {
        name: 'Cooking',
        shortDescription: 'Experimenting with new recipes',
        longDescription: "This one was very surprising to me as well. I never thought i would enjoy cooking this much. But covid cutting of market and me being a foodie led it being my favourite activity.",
        icon: Utensils,
        color: 'from-yellow-500 to-orange-500',
        image: '/hobby-cooking.jpg'
    }
];

export default function Hobbies() {
    const [hoveredHobby, setHoveredHobby] = useState<number | null>(null);

    return (
        <section id="hobbies" className="min-h-screen py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Hobbies & Interests
                    </h2>
                    <p className="text-gray-400 text-lg">
                        What I enjoy doing in my free time
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-4 h-[600px] lg:h-[400px]">
                    {hobbies.map((hobby, index) => (
                        <motion.div
                            key={hobby.name}
                            layout
                            onHoverStart={() => setHoveredHobby(index)}
                            onHoverEnd={() => setHoveredHobby(null)}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border border-surface hover:border-primary/50
                                ${hoveredHobby === index ? 'flex-[2]' : 'flex-1'}
                            `}
                        >
                            {/* Background Image (visible on hover or always? User said "expands ... with an image". Let's show image only on hover to be dramatic, or dim it normally) */}
                            {/* Let's have a background gradient normally, and fade in image on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${hobby.color} opacity-10`} />

                            {/* Detailed Image Background on Hover */}
                            <motion.div
                                className="absolute inset-0 z-0 bg-cover bg-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredHobby === index ? 1 : 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* We use a div with bg image or Next Image component */}
                                {/* Using a dark overlay on top of image for text readability */}
                                {hoveredHobby === index && (
                                    <>
                                        {/* Note: User needs to provide images. If missing, it will be blank/color. */}
                                        <img
                                            src={hobby.image}
                                            alt={hobby.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails - keeping the color gradient
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/70" />
                                    </>
                                )}
                            </motion.div>

                            <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                                <motion.div
                                    layout="position"
                                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${hobby.color} flex items-center justify-center mb-4`}
                                >
                                    <hobby.icon className="w-6 h-6 text-white" />
                                </motion.div>

                                <motion.h3 layout="position" className="text-xl font-bold text-white mb-2">
                                    {hobby.name}
                                </motion.h3>

                                <AnimatePresence mode="wait">
                                    {hoveredHobby === index ? (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-gray-200 text-sm md:text-base"
                                        >
                                            {hobby.longDescription}
                                        </motion.p>
                                    ) : (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-gray-400 text-sm truncate"
                                        >
                                            {hobby.shortDescription}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
