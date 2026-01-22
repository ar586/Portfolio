'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, Users, ChevronDown, ChevronUp, Calendar, Clock, Book } from 'lucide-react';
import api from '@/lib/api';

interface GitHubStats {
    public_repos: number;
    followers: number;
    following: number;
}

interface Repository {
    name: string;
    description: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    html_url: string;
}

interface GitHubEvent {
    id: string;
    type: string;
    repo: {
        name: string;
        url: string;
    };
    created_at: string;
    payload?: any;
}

export default function GitHub() {
    const [stats, setStats] = useState<GitHubStats | null>(null);
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [allRepos, setAllRepos] = useState<Repository[]>([]);
    const [events, setEvents] = useState<GitHubEvent[]>([]);
    const [heatmap, setHeatmap] = useState<any[] | null>(null); // Array of {date, count, level}
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            api.getGitHubStats(),
            api.getGitHubRepos()
        ])
            .then(([statsRes, reposRes]) => {
                setStats(statsRes.data);
                const sortedRepos = reposRes.data.repos.sort((a: Repository, b: Repository) => b.stargazers_count - a.stargazers_count);
                setRepos(sortedRepos.slice(0, 6)); // Top 6 repos by stars
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch GitHub data:', err);
                setLoading(false);
            });
    }, []);

    const toggleExpand = () => {
        if (!expanded && allRepos.length === 0) {
            setDetailsLoading(true);
            Promise.all([
                api.getGitHubRepos(), // Use cached repos (contains all)
                api.getGitHubEvents(),
                api.getGitHubHeatmap()
            ])
                .then(([reposRes, eventsRes, heatmapRes]) => {
                    setAllRepos(reposRes.data.repos || []);
                    setEvents(eventsRes.data || []);

                    // Access nested data: response.data -> { data: { contributions: [] } }
                    const contribs = heatmapRes.data?.data?.contributions || [];
                    setHeatmap(contribs);

                    setDetailsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch details:', err);
                    setDetailsLoading(false);
                });
        }
        setExpanded(!expanded);
    };

    const formatEventType = (type: string) => {
        return type.replace('Event', '').replace(/([A-Z])/g, ' $1').trim();
    };

    // Helper to render heatmap grid (Last 12 months)
    const renderHeatmap = () => {
        if (!heatmap || heatmap.length === 0) return null;

        // GitHub colors (Level 0-4)
        const getLevelColor = (level: number) => {
            switch (level) {
                case 0: return 'bg-white/5';
                case 1: return 'bg-green-900';
                case 2: return 'bg-green-700';
                case 3: return 'bg-green-500';
                case 4: return 'bg-green-300';
                default: return 'bg-white/5';
            }
        };

        // We need to map the flat list to a 7x52 grid aligned by week
        // The API returns a sorted list of days. We just need to slice the last 365 days.
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setDate(today.getDate() - 365);

        // Filter contributions for the last year
        // And ensure we align to weeks (Sunday start)

        // Find the start date (previous Sunday from oneYearAgo)
        const dayOfWeek = oneYearAgo.getDay();
        const startDate = new Date(oneYearAgo);
        startDate.setDate(startDate.getDate() - dayOfWeek);

        // Create map for easy lookup
        const contribMap = new Map();
        heatmap.forEach(day => {
            contribMap.set(day.date, day);
        });

        const weeks = [];
        let currentWeek = [];
        const currentDate = new Date(startDate);

        // Generate weeks until today
        while (currentDate <= today || currentWeek.length > 0) {
            if (currentDate > today && currentWeek.length === 7) break;

            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = contribMap.get(dateKey);

            currentWeek.push({
                date: dateKey,
                count: dayData ? dayData.count : 0,
                level: dayData ? dayData.level : 0,
                color: getLevelColor(dayData ? dayData.level : 0)
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Push last partial week
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return (
            <div className="flex flex-col gap-1 overflow-x-auto pb-2">
                <div className="flex gap-[3px]">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dIndex) => {
                                if (!day) return <div key={dIndex} className="w-3 h-3" />;
                                return (
                                    <div
                                        key={dIndex}
                                        className={`w-3 h-3 rounded-[2px] ${day.color} hover:ring-1 hover:ring-white/50 transition-all cursor-default`}
                                        title={`${day.date}: ${day.count} contributions`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                    <span>Less</span>
                    <div className="flex gap-1 items-center">
                        <div className="w-3 h-3 bg-white/5 rounded-[2px]" />
                        <div className="w-3 h-3 bg-green-900 rounded-[2px]" />
                        <div className="w-3 h-3 bg-green-700 rounded-[2px]" />
                        <div className="w-3 h-3 bg-green-500 rounded-[2px]" />
                        <div className="w-3 h-3 bg-green-300 rounded-[2px]" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        );
    };

    return (
        <section id="github" className="min-h-screen py-20 bg-surface/50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        GitHub Activity
                    </h2>
                    <p className="text-gray-400 text-lg">
                        My open source contributions
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-background p-6 rounded-xl border border-github/30"
                            >
                                <div className="text-github text-4xl font-bold mb-2">
                                    {stats?.public_repos || 0}
                                </div>
                                <div className="text-gray-400">Public Repositories</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-background p-6 rounded-xl border border-github/30"
                            >
                                <div className="text-github text-4xl font-bold mb-2">
                                    {stats?.followers || 0}
                                </div>
                                <div className="text-gray-400">Followers</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-background p-6 rounded-xl border border-github/30"
                            >
                                <div className="text-github text-4xl font-bold mb-2">
                                    {stats?.following || 0}
                                </div>
                                <div className="text-gray-400">Following</div>
                            </motion.div>
                        </div>

                        {/* Top Repositories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {repos.map((repo, index) => (
                                <motion.a
                                    key={repo.name}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-background p-6 rounded-xl border border-surface hover:border-github/50 transition-all"
                                >
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        {repo.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {repo.description || 'No description'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        {repo.language && (
                                            <span className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-github"></div>
                                                {repo.language}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            {repo.stargazers_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GitFork className="w-4 h-4" />
                                            {repo.forks_count}
                                        </span>
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Expand Button */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={toggleExpand}
                                className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors animate-bounce"
                            >
                                <span className="text-sm font-medium">
                                    {expanded ? "Show Less" : "View Detailed Stats"}
                                </span>
                                {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
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
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-github"></div>
                                        </div>
                                    ) : (
                                        <div className="bg-background/50 rounded-2xl p-6 border border-white/5 space-y-8">
                                            {/* Contribution Heatmap */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4 text-green-400">
                                                    <Calendar className="w-5 h-5" />
                                                    <h3 className="text-lg font-semibold">Contribution Map (Last 12 Months)</h3>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl overflow-x-auto">
                                                    {renderHeatmap()}
                                                </div>
                                            </div>

                                            {/* Recent Activity */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                                    <Clock className="w-5 h-5" />
                                                    <h3 className="text-lg font-semibold">Recent Contributions</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {events.map((event) => (
                                                        <a
                                                            key={event.id}
                                                            href={`https://github.com/${event.repo.name}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 font-mono">
                                                                    {formatEventType(event.type)}
                                                                </span>
                                                                <span className="font-medium text-gray-200 group-hover:text-white">
                                                                    {event.repo.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-mono">
                                                                {new Date(event.created_at).toLocaleDateString()}
                                                            </span>
                                                        </a>
                                                    ))}
                                                    {events.length === 0 && (
                                                        <p className="text-gray-500 text-center py-4">No recent activity found.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* All Repositories */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4 text-purple-400">
                                                    <Book className="w-5 h-5" />
                                                    <h3 className="text-lg font-semibold">All Repositories ({allRepos.length})</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {allRepos.map((repo) => (
                                                        <a
                                                            key={repo.name}
                                                            href={repo.html_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-purple-500/30 transition-all"
                                                        >
                                                            <h4 className="font-bold text-gray-200 mb-1 truncate">{repo.name}</h4>
                                                            <p className="text-xs text-gray-400 line-clamp-2 mb-2 h-8">
                                                                {repo.description || "No description provided."}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                {repo.language && (
                                                                    <span className="flex items-center gap-1">
                                                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                                        {repo.language}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1">
                                                                    <Star className="w-3 h-3" />
                                                                    {repo.stargazers_count}
                                                                </span>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </section>
    );
}
