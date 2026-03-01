'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp, Calendar, Clock, Edit3 } from 'lucide-react';
import api from '../lib/api';

interface LeetCodeStats {
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    ranking: number;
}

interface RecentSubmission {
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
}

export default function LeetCode() {
    const [stats, setStats] = useState<LeetCodeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [heatmap, setHeatmap] = useState<Record<string, number> | null>(null);
    const [recentSolves, setRecentSolves] = useState<RecentSubmission[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        api.getLeetCodeStats()
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch LeetCode stats:', err);
                setLoading(false);
            });
    }, []);

    const toggleExpand = () => {
        if (!expanded && !heatmap) {
            setDetailsLoading(true);
            Promise.all([
                api.getLeetCodeHeatmap(),
                api.getLeetCodeRecent()
            ])
                .then(([heatmapRes, recentRes]) => {
                    let calendarData = heatmapRes.data?.data?.submissionCalendar || heatmapRes.data?.submissionCalendar;

                    if (typeof calendarData === 'string') {
                        try {
                            calendarData = JSON.parse(calendarData);
                        } catch (e) {
                            console.error("Failed to parse submissionCalendar", e);
                            calendarData = {};
                        }
                    }
                    setHeatmap(calendarData);
                    setRecentSolves(recentRes.data.recentAcSubmissionList || []);
                    setDetailsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch details:', err);
                    setDetailsLoading(false);
                });
        }
        setExpanded(!expanded);
    };

    const getPercentage = (solved: number, total: number = 3000) => {
        return (solved / total) * 100;
    };

    const renderHeatmap = () => {
        if (!heatmap) return null;

        const dateSubmissions: Record<string, number> = {};
        Object.entries(heatmap).forEach(([ts, cnt]) => {
            const date = new Date(parseInt(ts) * 1000);
            const dateKey = date.toISOString().split('T')[0];
            dateSubmissions[dateKey] = (dateSubmissions[dateKey] || 0) + cnt;
        });

        const getLevelColor = (count: number) => {
            if (count === 0) return 'bg-surface border border-text-main/10';
            if (count <= 2) return 'bg-text-main/30 border border-text-main/30';
            if (count <= 4) return 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxsaW5lIHgxPSIwIiB5MT0iNCIgeDI9IjQiIHkyPSIwIiBzdHJva2U9IiMxMTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==")] border border-text-main/60';
            if (count <= 6) return 'bg-text-main/80 border border-text-main';
            return 'bg-text-main border border-text-main';
        };

        const today = new Date();
        const totalDays = 365;

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - totalDays);

        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const weeks = [];
        let currentWeek = [];
        const currentDate = new Date(startDate);

        while (currentDate <= today || currentWeek.length > 0) {
            if (currentDate > today && currentWeek.length === 7) break;

            const dateKey = currentDate.toISOString().split('T')[0];
            const count = dateSubmissions[dateKey] || 0;

            currentWeek.push({
                date: new Date(currentDate),
                count: count,
                color: getLevelColor(count)
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return (
            <div className="flex flex-col gap-1 overflow-x-auto pb-4">
                <div className="flex gap-[2px]">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[2px]">
                            {week.map((day, dIndex) => {
                                if (!day) return <div key={dIndex} className="w-3 h-3" />;
                                return (
                                    <div
                                        key={dIndex}
                                        className={`w-3 h-3 rounded-none ${day.color} hover:ring-2 hover:ring-text-main hover:z-10 relative cursor-crosshair transition-none`}
                                        title={`${day.date.toDateString()}: ${day.count} submissions`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] tracking-[0.2em] font-bold uppercase text-text-main px-1 mt-3">
                    <span>Sparse</span>
                    <div className="flex gap-1 items-center">
                        <div className="w-3 h-3 bg-surface border border-text-main/10" />
                        <div className="w-3 h-3 bg-text-main/30 border border-text-main/30" />
                        <div className="w-3 h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxsaW5lIHgxPSIwIiB5MT0iNCIgeDI9IjQiIHkyPSIwIiBzdHJva2U9IiMxMTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] border border-text-main/60" />
                        <div className="w-3 h-3 bg-text-main/80 border border-text-main" />
                        <div className="w-3 h-3 bg-text-main border border-text-main" />
                    </div>
                    <span>Dense</span>
                </div>
            </div>
        );
    };

    return (
        <section id="leetcode" className="py-12 md:py-20 border-b-4 border-text-main bg-primary text-text-main">
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-10 border-b-[3px] border-text-main pb-4">
                    <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-black font-serif uppercase tracking-tight text-center leading-none">
                        Daily Puzzles & Logic
                    </h2>
                    <p className="mt-4 text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold uppercase text-center border-y border-text-main py-2 inline-block px-12">
                        Algorithmic Training & Exercises
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 font-serif italic text-xl">
                        Compiling puzzle statistics...
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        {/* Main Stats Block */}
                        <div className="border-[3px] border-text-main bg-surface p-1 shadow-[8px_8px_0px_#111] mb-12">
                            <div className="border border-text-main bg-primary border-dashed p-8 md:p-12 pb-0 md:pb-0">
                                <div className="grid grid-cols-1 md:grid-cols-12 md:gap-12 relative overflow-hidden">

                                    {/* Left: Global Rank & Total */}
                                    <div className="text-center md:text-left flex flex-col items-center md:items-start md:col-span-5 md:border-r-2 border-text-main border-dashed md:pr-12 md:pb-12 pb-8 border-b-2 md:border-b-0 mb-8 md:mb-0">
                                        <div className="flex items-center gap-3 mb-8 border-[1.5px] border-text-main px-4 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-surface">
                                            <Trophy className="w-5 h-5" />
                                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Global Ranking</span>
                                        </div>

                                        <div className="font-serif font-black text-4xl md:text-5xl lg:text-5xl leading-none mb-6 text-center md:text-left">
                                            #{stats?.ranking.toLocaleString() || 'N/A'}
                                        </div>

                                        <div className="w-full h-px bg-text-main mb-6"></div>

                                        <div className="text-[5rem] lg:text-[6rem] font-black font-serif tracking-tighter leading-none mb-2">
                                            {stats?.total_solved || 0}
                                        </div>
                                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-main">
                                            Conundrums Resolved
                                        </div>
                                    </div>

                                    {/* Right: Difficulty Breakdown */}
                                    <div className="flex flex-col justify-center gap-8 md:col-span-7 pb-8 md:pb-12 h-full">

                                        {/* Easy */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end border-b border-text-main pb-1">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                                                    Introductory
                                                </span>
                                                <span className="font-serif font-black text-2xl">{stats?.easy_solved || 0} <span className="text-sm font-sans font-normal italic">/ 800+</span></span>
                                            </div>
                                            <div className="w-full bg-surface border border-text-main h-4 p-0.5 shadow-[1px_1px_0px_#111]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${getPercentage(stats?.easy_solved || 0, 800)}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxsaW5lIHgxPSIwIiB5MT0iNCIgeDI9IjQiIHkyPSIwIiBzdHJva2U9IiMxMTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-repeat"
                                                />
                                            </div>
                                        </div>

                                        {/* Medium */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end border-b border-text-main pb-1">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                                                    Intermediate
                                                </span>
                                                <span className="font-serif font-black text-2xl">{stats?.medium_solved || 0} <span className="text-sm font-sans font-normal italic">/ 1700+</span></span>
                                            </div>
                                            <div className="w-full bg-surface border border-text-main h-4 p-0.5 shadow-[1px_1px_0px_#111]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${getPercentage(stats?.medium_solved || 0, 1700)}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: 0.3 }}
                                                    className="h-full bg-text-main/40"
                                                />
                                            </div>
                                        </div>

                                        {/* Hard */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end border-b border-text-main pb-1">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                                                    Advanced
                                                </span>
                                                <span className="font-serif font-black text-2xl">{stats?.hard_solved || 0} <span className="text-sm font-sans font-normal italic">/ 700+</span></span>
                                            </div>
                                            <div className="w-full bg-surface border border-text-main h-4 p-0.5 shadow-[1px_1px_0px_#111]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${getPercentage(stats?.hard_solved || 0, 700)}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: 0.4 }}
                                                    className="h-full bg-text-main"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expand Button */}
                        <div className="flex justify-center mb-10">
                            <button
                                onClick={toggleExpand}
                                className="flex items-center gap-2 px-8 py-3 border-2 border-text-main font-bold text-[10px] tracking-[0.3em] uppercase hover:bg-text-main hover:text-primary transition-all shadow-[2px_2px_0px_#111]"
                            >
                                <span>{expanded ? "Fold Detailed Record" : "Unfold Detailed Record"}</span>
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    {detailsLoading ? (
                                        <div className="flex justify-center py-12 font-serif italic text-xl">
                                            Retrieving archival data...
                                        </div>
                                    ) : (
                                        <div className="border border-text-main bg-surface p-6 md:p-10 shadow-[8px_8px_0px_#111] mb-4 space-y-12">

                                            {/* Heatmap Section */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-6 border-b-2 border-text-main pb-3">
                                                    <Calendar className="w-5 h-5" />
                                                    <h3 className="text-xs font-black tracking-[0.2em] uppercase">Chronological Heatmap</h3>
                                                </div>
                                                <div className="overflow-x-auto border-2 border-text-main p-4 bg-primary shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                    {renderHeatmap()}
                                                </div>
                                            </div>

                                            {/* Recent Submissions */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-6 border-b-2 border-text-main pb-3">
                                                    <Edit3 className="w-5 h-5" />
                                                    <h3 className="text-xs font-black tracking-[0.2em] uppercase">Recent Resolutions</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {recentSolves.slice(0, 6).map((solve) => (
                                                        <a
                                                            key={solve.id}
                                                            href={`https://leetcode.com/problems/${solve.titleSlug}/`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex flex-col p-4 border border-text-main bg-primary hover:bg-text-main hover:text-primary transition-colors group"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <span className="font-serif font-bold text-lg leading-tight uppercase truncate max-w-[80%] mb-4">
                                                                    {solve.title}
                                                                </span>
                                                            </div>
                                                            <div className="mt-auto border-t border-current/30 pt-3 flex items-center justify-between">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest border border-current px-2 py-0.5">
                                                                    Resolved
                                                                </span>
                                                                <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(parseInt(solve.timestamp) * 1000).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </a>
                                                    ))}
                                                    {recentSolves.length === 0 && (
                                                        <p className="font-serif italic py-4 col-span-full text-center">No recent solutions chronicled.</p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </section>
    );
}
