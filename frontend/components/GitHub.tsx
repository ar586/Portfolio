'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, Users, ChevronDown, ChevronUp, Calendar, Clock, Book, ExternalLink } from 'lucide-react';
import api from '../lib/api';

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
    updated_at: string;
    topics?: string[];
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
    const [heatmap, setHeatmap] = useState<any[] | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars');

    useEffect(() => {
        Promise.all([
            api.getGitHubStats(),
            api.getGitHubRepos()
        ])
            .then(([statsRes, reposRes]) => {
                setStats(statsRes.data);
                let sortedRepos = reposRes.data.repos.sort((a: Repository, b: Repository) => b.stargazers_count - a.stargazers_count);

                // Pin 'dastabbej' to top
                const pinnedRepoIndex = sortedRepos.findIndex((r: Repository) => r.name.toLowerCase().includes('dastabbej'));
                if (pinnedRepoIndex > -1) {
                    const pinnedRepo = sortedRepos.splice(pinnedRepoIndex, 1)[0];
                    sortedRepos.unshift(pinnedRepo);
                }

                setRepos(sortedRepos.slice(0, 3)); // Top 3 repos
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
                api.getGitHubRepos(),
                api.getGitHubEvents(),
                api.getGitHubHeatmap()
            ])
                .then(([reposRes, eventsRes, heatmapRes]) => {
                    setAllRepos(reposRes.data.repos || []);
                    setEvents(eventsRes.data || []);
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

    const getLanguageStats = () => {
        const langCounts: Record<string, number> = {};
        allRepos.forEach(repo => {
            if (repo.language) {
                langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            }
        });
        const total = Object.values(langCounts).reduce((a, b) => a + b, 0);
        return Object.entries(langCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([lang, count]) => ({
                name: lang,
                count,
                percentage: Math.round((count / total) * 100),
                color: getLanguageColor(lang)
            }));
    };

    const getLanguageColor = (lang: string) => {
        const colors: Record<string, string> = {
            'TypeScript': '#3178c6',
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Svelte': '#ff3e00',
            'Vue': '#41b883',
            'Rust': '#dea584',
            'Go': '#00ADD8'
        };
        return colors[lang] || '#8b949e';
    };

    const getSortedRepos = () => {
        return [...allRepos].sort((a, b) => {
            if (sortBy === 'stars') {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
    };

    // Helper to render heatmap grid (Last 12 months)
    const renderHeatmap = () => {
        if (!heatmap || heatmap.length === 0) return null;

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

        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setDate(today.getDate() - 365);

        const dayOfWeek = oneYearAgo.getDay();
        const startDate = new Date(oneYearAgo);
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const contribMap = new Map();
        heatmap.forEach(day => {
            contribMap.set(day.date, day);
        });

        const weeks = [];
        let currentWeek = [];
        const currentDate = new Date(startDate);

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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto bg-[#0d1117] rounded-3xl border border-[#30363d] overflow-hidden mb-12 shadow-2xl group relative"
                        >
                            <div className="absolute inset-0 bg-[url('https://github.githubassets.com/images/modules/site/home/hero-glow.svg')] bg-cover opacity-20 pointer-events-none"></div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
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
                                                <p className="text-xs text-gray-400 line-clamp-3 mb-3">
                                                    {repo.description || 'No description available'}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                                                    {repo.language && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                                                            {repo.language}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <GitFork className="w-3 h-3" />
                                                        {repo.forks_count}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(repo.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

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
                                            {/* Top Section: Languages and Contribution Map */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Language Distribution */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4 text-purple-400">
                                                        <Book className="w-5 h-5" />
                                                        <h3 className="text-lg font-semibold">Languages</h3>
                                                    </div>
                                                    <div className="p-4 bg-white/5 rounded-xl">
                                                        <div className="space-y-3">
                                                            {getLanguageStats().map((lang) => (
                                                                <div key={lang.name}>
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-200">{lang.name}</span>
                                                                        <span className="text-gray-400">{lang.percentage}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${lang.percentage}%` }}
                                                                            className="h-full rounded-full"
                                                                            style={{ backgroundColor: lang.color }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {getLanguageStats().length === 0 && (
                                                                <p className="text-gray-500 text-sm">No language data available.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contribution Heatmap */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4 text-green-400">
                                                        <Calendar className="w-5 h-5" />
                                                        <h3 className="text-lg font-semibold">Contribution Map</h3>
                                                    </div>
                                                    <div className="p-4 bg-white/5 rounded-xl overflow-x-auto">
                                                        {renderHeatmap()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recent Activity */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                                    <Clock className="w-5 h-5" />
                                                    <h3 className="text-lg font-semibold">Recent Contributions</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {events.slice(0, 6).map((event) => (
                                                        <a
                                                            key={event.id}
                                                            href={`https://github.com/${event.repo.name}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group border border-white/5 hover:border-blue-500/30"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 font-mono">
                                                                    {formatEventType(event.type)}
                                                                </span>
                                                                <span className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors truncate max-w-[150px] md:max-w-[200px]">
                                                                    {event.repo.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-mono whitespace-nowrap ml-2">
                                                                {new Date(event.created_at).toLocaleDateString()}
                                                            </span>
                                                        </a>
                                                    ))}
                                                    {events.length === 0 && (
                                                        <p className="text-gray-500 text-center py-4 col-span-full">No recent activity found.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* All Repositories */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2 text-purple-400">
                                                        <Book className="w-5 h-5" />
                                                        <h3 className="text-lg font-semibold">All Repositories ({allRepos.length})</h3>
                                                    </div>
                                                    <div className="flex bg-white/5 rounded-lg p-1">
                                                        <button
                                                            onClick={() => setSortBy('stars')}
                                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${sortBy === 'stars' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                                        >
                                                            Stars
                                                        </button>
                                                        <button
                                                            onClick={() => setSortBy('updated')}
                                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${sortBy === 'updated' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                                        >
                                                            Updated
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {getSortedRepos().map((repo) => (
                                                        <a
                                                            key={repo.name}
                                                            href={repo.html_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-purple-500/30 transition-all"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-gray-200 truncate pr-2 flex-1">{repo.name}</h4>
                                                                {repo.language && (
                                                                    <div
                                                                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                                                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                                                                        title={repo.language}
                                                                    />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400 line-clamp-4 mb-3 min-h-[4rem]">
                                                                {repo.description || "No description provided."}
                                                            </p>
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex items-center gap-1">
                                                                        <Star className="w-3 h-3" />
                                                                        {repo.stargazers_count}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <GitFork className="w-3 h-3" />
                                                                        {repo.forks_count}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px]">
                                                                    {new Date(repo.updated_at).toLocaleDateString()}
                                                                </span>
                                                            </div>

                                                            {/* Topics/Tags - Simplified */}
                                                            {repo.topics && repo.topics.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-3">
                                                                    {repo.topics.slice(0, 3).map(topic => (
                                                                        <span key={topic} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">
                                                                            {topic}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
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
