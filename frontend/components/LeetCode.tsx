'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';
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
                    // Backend returns { data: { submissionCalendar: "..." }, ... }
                    // So we need heatmapRes.data.data.submissionCalendar
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

    // Helper to render heatmap grid (Last 12 months, similar to LeetCode/GitHub)
    const renderHeatmap = () => {
        if (!heatmap) return null;

        // Pre-process heatmap data into a date map
        // Moved inside to ensure it has access to heatmap state and re-runs on change
        const dateSubmissions: Record<string, number> = {};
        Object.entries(heatmap).forEach(([ts, cnt]) => {
            const date = new Date(parseInt(ts) * 1000);
            const dateKey = date.toISOString().split('T')[0];
            dateSubmissions[dateKey] = (dateSubmissions[dateKey] || 0) + cnt;
        });

        // LeetCode colors - brighter for visibility
        const getLevelColor = (count: number) => {
            if (count === 0) return 'bg-[#3e3e3e]'; // Empty/Inactive
            if (count <= 2) return 'bg-[#005c49]'; // Light activity
            if (count <= 5) return 'bg-[#008f72]'; // Medium
            return 'bg-[#00b8a3]'; // High activity
        };

        const today = new Date();
        const totalDays = 365; // Show last year

        // Calculate start date (365 days ago)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - totalDays);

        // Adjust start date to previous Sunday to align grid
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const weeks = [];
        let currentWeek = [];
        const currentDate = new Date(startDate);

        // Generate grid data
        // We go until we reach today or slightly past to fill the week
        while (currentDate <= today || currentWeek.length > 0) {
            // Check if date is in future (stop if so, but finish current week)
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

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Push incomplete last week if needed
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null); // Empty slots
            }
            weeks.push(currentWeek);
        }

        return (
            <div className="flex flex-col gap-1 overflow-x-auto pb-2">
                {/*  Render as rows of weeks? No, standard is columns are weeks. */}
                {/* Flex row of columns */}
                <div className="flex gap-[3px]">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dIndex) => {
                                if (!day) return <div key={dIndex} className="w-3 h-3" />; // Spacer
                                return (
                                    <div
                                        key={dIndex}
                                        className={`w-3 h-3 rounded-[2px] ${day.color} hover:ring-1 hover:ring-white/50 transition-all cursor-default`}
                                        title={`${day.date.toDateString()}: ${day.count} submissions`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                    <span>Less</span>
                    <div className="flex gap-1 items-center">
                        <div className="w-3 h-3 bg-[#3e3e3e] rounded-[2px]" />
                        <div className="w-3 h-3 bg-[#005c49] rounded-[2px]" />
                        <div className="w-3 h-3 bg-[#008f72] rounded-[2px]" />
                        <div className="w-3 h-3 bg-[#00b8a3] rounded-[2px]" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        );
    };

    return (
        <section id="leetcode" className="min-h-screen py-12 md:py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        LeetCode Progress
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Problem solving statistics
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leetcode"></div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {/* Unified Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-[#282828] rounded-3xl border border-[#3e3e3e] p-8 md:p-10 mb-12 shadow-2xl relative overflow-hidden group"
                        >
                            {/* Decorative Background Blob - LeetCode Orange */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffa116]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#ffa116]/20 transition-all duration-500"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
                                {/* Left: Main Stats */}
                                <div className="text-center md:text-left flex flex-col items-center md:items-start">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-[#3e3e3e] text-[#ffa116]">
                                            <Trophy className="w-6 h-6" />
                                        </div>
                                        <span className="text-gray-400 font-medium">Rank #{stats?.ranking.toLocaleString() || 'N/A'}</span>
                                    </div>

                                    <div className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-2">
                                        {stats?.total_solved || 0}
                                    </div>
                                    <div className="text-xl text-gray-400 font-light">
                                        Problems Solved
                                    </div>
                                </div>

                                {/* Right: Difficulty Breakdown */}
                                <div className="flex flex-col justify-center gap-6">
                                    {/* Easy */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-green-400 font-medium flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div> Easy
                                            </span>
                                            <span className="text-white font-bold text-lg">{stats?.easy_solved || 0} <span className="text-gray-600 text-sm font-normal">/ 800+</span></span>
                                        </div>
                                        <div className="w-full bg-[#3e3e3e] rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${getPercentage(stats?.easy_solved || 0, 800)}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-gradient-to-r from-green-500 to-[#00b8a3] rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Medium */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[#ffc01e] font-medium flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#ffc01e]"></div> Medium
                                            </span>
                                            <span className="text-white font-bold text-lg">{stats?.medium_solved || 0} <span className="text-gray-500 text-sm font-normal">/ 1700+</span></span>
                                        </div>
                                        <div className="w-full bg-[#3e3e3e] rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${getPercentage(stats?.medium_solved || 0, 1700)}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                                className="h-full bg-gradient-to-r from-[#ffc01e] to-[#ffc01e] rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Hard */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[#ff375f] font-medium flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#ff375f]"></div> Hard
                                            </span>
                                            <span className="text-white font-bold text-lg">{stats?.hard_solved || 0} <span className="text-gray-500 text-sm font-normal">/ 700+</span></span>
                                        </div>
                                        <div className="w-full bg-[#3e3e3e] rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${getPercentage(stats?.hard_solved || 0, 700)}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.4 }}
                                                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Expand Button */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={toggleExpand}
                                className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <span className="text-sm font-medium">
                                    {expanded ? "Show Less" : "View Detailed Stats"}
                                </span>
                                {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Expanded Content: Heatmap & Recent */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    {detailsLoading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#282828] rounded-2xl p-6 border border-[#3e3e3e] space-y-8 shadow-2xl">
                                            {/* Heatmap Section */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4 text-[#ffa116]">
                                                    <Calendar className="w-5 h-5" />
                                                    <h3 className="text-lg font-semibold">Activity Heatmap (Last 12 Months)</h3>
                                                </div>
                                                <div className="p-4 bg-[#3e3e3e]/50 rounded-xl overflow-x-auto text-gray-300">
                                                    {renderHeatmap()}
                                                </div>
                                            </div>

                                            {/* Recent Submissions */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4 text-[#ffa116]">
                                                    <Clock className="w-5 h-5" />
                                                    <h3 className="text-lg font-semibold">Recent Solves</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {recentSolves.slice(0, 5).map((solve) => (
                                                        <a
                                                            key={solve.id}
                                                            href={`https://leetcode.com/problems/${solve.titleSlug}/`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-[#3e3e3e] hover:bg-[#4a4a4a] rounded-lg transition-colors group"
                                                        >
                                                            <span className="font-medium text-gray-200 group-hover:text-white truncate max-w-[70%]">
                                                                {solve.title}
                                                            </span>
                                                            <span className="text-xs text-gray-400 font-mono">
                                                                {new Date(parseInt(solve.timestamp) * 1000).toLocaleDateString()}
                                                            </span>
                                                        </a>
                                                    ))}
                                                    {recentSolves.length === 0 && (
                                                        <p className="text-gray-500 text-center py-4">No recent submissions found.</p>
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
