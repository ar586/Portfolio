'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, Users, ChevronDown, ChevronUp, Calendar, Clock, Book, ExternalLink } from 'lucide-react';
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
        <section id="github" className="min-h-screen py-20">
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
                        {/* Unified GitHub Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto bg-[#0d1117] rounded-3xl border border-[#30363d] overflow-hidden mb-12 shadow-2xl group relative"
                        >
                            {/* Decorative Grid Background - Subtle */}
                            <div className="absolute inset-0 bg-[url('https://github.githubassets.com/images/modules/site/home/hero-glow.svg')] bg-cover opacity-20 pointer-events-none"></div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                                {/* Left Column: Main Stats */}
                                <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-[#30363d] bg-[#0d1117]/50 relative z-10">
                                    <div className="mb-6 p-4 rounded-full bg-white/5 border border-[#30363d]">
                                        <Book className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-gray-400 text-lg font-medium mb-1">Total Repositories</h3>
                                    <div className="text-6xl md:text-7xl font-bold text-white tracking-tight mb-4">
                                        {stats?.public_repos || 0}
                                    </div>
                                    <a
                                        href="https://github.com/ar586?tab=repositories"
                                        target="_blank"
                                        className="text-[#58a6ff] hover:text-[#58a6ff] hover:underline text-sm font-medium flex items-center gap-1"
                                    >
                                        View Profile <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* Right Column: Top 3 Repos */}
                                <div className="md:col-span-7 p-8 md:p-12 bg-[#0d1117] relative z-10">
                                    <div className="flex items-center gap-2 mb-6 text-gray-200">
                                        <Star className="w-5 h-5 text-[#e3b341]" />
                                        <h3 className="text-lg font-bold">Top Repositories</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {repos.slice(0, 3).map((repo) => (
                                            <a
                                                key={repo.name}
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#8b949e] transition-all group/repo"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-[#58a6ff] group-hover/repo:underline truncate pr-4">
                                                        {repo.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                                        <Star className="w-3 h-3" />
                                                        <span>{repo.stargazers_count}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-[#8b949e] line-clamp-1 mb-3">
                                                    {repo.description || 'No description available'}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                                                    {repo.language && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-[#f1e05a]"></span>
                                                            {repo.language}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <GitFork className="w-3 h-3" />
                                                        {repo.forks_count}
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
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
                                                    {events.slice(0, 5).map((event) => (
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
