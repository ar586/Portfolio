'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, ChevronDown, ChevronUp, Calendar, Clock, Book, ExternalLink } from 'lucide-react';
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

                const pinnedRepoIndex = sortedRepos.findIndex((r: Repository) => r.name.toLowerCase().includes('dastabbej'));
                if (pinnedRepoIndex > -1) {
                    const pinnedRepo = sortedRepos.splice(pinnedRepoIndex, 1)[0];
                    sortedRepos.unshift(pinnedRepo);
                }

                setRepos(sortedRepos.slice(0, 3));
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
            }));
    };

    const getSortedRepos = () => {
        return [...allRepos].sort((a, b) => {
            if (sortBy === 'stars') {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
    };

    const renderHeatmap = () => {
        if (!heatmap || heatmap.length === 0) return null;

        const getLevelColor = (level: number) => {
            // Strict newspaper ink scale
            switch (level) {
                case 0: return 'bg-surface border border-text-main/10';
                case 1: return 'bg-text-main/20 border border-text-main/30';
                case 2: return 'bg-text-main/50 border border-text-main/60';
                case 3: return 'bg-text-main/80 border border-text-main';
                case 4: return 'bg-text-main border border-text-main';
                default: return 'bg-surface border border-text-main/10';
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
                                        title={`${day.date}: ${day.count} contributions`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] tracking-[0.2em] font-bold uppercase text-text-main px-1 mt-3">
                    <span>Low Activity</span>
                    <div className="flex gap-1 items-center">
                        <div className="w-3 h-3 bg-surface border border-text-main/10" />
                        <div className="w-3 h-3 bg-text-main/20 border border-text-main/30" />
                        <div className="w-3 h-3 bg-text-main/50 border border-text-main/60" />
                        <div className="w-3 h-3 bg-text-main/80 border border-text-main" />
                        <div className="w-3 h-3 bg-text-main border border-text-main" />
                    </div>
                    <span>High Activity</span>
                </div>
            </div>
        );
    };

    return (
        <section id="github" className="py-12 md:py-20 border-b-4 border-text-main bg-primary text-text-main">
            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-10 border-b-[3px] border-text-main pb-4">
                    <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-black font-serif uppercase tracking-tight text-center leading-none">
                        Market Data: Open Source
                    </h2>
                    <p className="mt-4 text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold uppercase text-center border-y border-text-main py-2 inline-block px-12">
                        Quarterly Contributions & Statistics
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 font-serif italic text-xl">
                        Compiling market data...
                    </div>
                ) : (
                    <>
                        {/* Highlights Grid */}
                        <div className="border-4 border-text-main bg-surface p-1 shadow-[6px_6px_0px_#111] mb-12">
                            <div className="border border-text-main bg-primary p-6 md:p-10">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative">

                                    {/* Left: Ticker/Overview */}
                                    <div className="text-center md:text-left flex flex-col items-center justify-center md:items-start md:col-span-5 md:border-r-2 border-text-main md:pr-12 border-dashed">
                                        <div className="flex items-center gap-3 mb-6 border-2 border-text-main p-3 shadow-[2px_2px_0px_#111]">
                                            <Book className="w-6 h-6" />
                                            <span className="text-sm font-bold tracking-[0.2em] uppercase">Total Assets</span>
                                        </div>

                                        <div className="text-7xl md:text-[6rem] font-black font-serif tracking-tighter mb-4 leading-none">
                                            {stats?.public_repos || 0}
                                        </div>
                                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase w-full text-center md:text-left border-y border-text-main py-2 mb-6">
                                            Public Repositories
                                        </div>
                                        <a
                                            href="https://github.com/ar586?tab=repositories"
                                            target="_blank"
                                            className="font-bold text-xs tracking-widest uppercase flex items-center gap-2 hover:underline group"
                                        >
                                            Inspect Full Ledger <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>

                                    {/* Right: Top Performing Assets */}
                                    <div className="flex flex-col justify-center gap-6 md:col-span-7">
                                        <div className="flex items-center gap-3 mb-2 border-b-2 border-text-main pb-3">
                                            <Star className="w-5 h-5 fill-text-main" />
                                            <h3 className="text-sm tracking-[0.2em] uppercase font-black">Top Performing Assets</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {repos.slice(0, 3).map((repo) => (
                                                <a
                                                    key={repo.name}
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block p-4 border border-text-main bg-surface hover:bg-text-main hover:text-primary transition-all group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-serif font-black text-xl truncate pr-4 uppercase">
                                                            {repo.name}
                                                        </h4>
                                                        <div className="flex items-center gap-1 font-bold text-sm">
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                            <span>{repo.stargazers_count}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-serif italic mb-4 line-clamp-2">
                                                        {repo.description || 'No description filed.'}
                                                    </p>
                                                    <div className="flex items-center gap-6 font-sans text-[10px] font-bold tracking-[0.2em] uppercase border-t border-current/30 pt-3">
                                                        {repo.language && (
                                                            <span>Lang: {repo.language}</span>
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
                            </div>
                        </div>

                        {/* Expand Button */}
                        <div className="flex justify-center mb-10">
                            <button
                                onClick={toggleExpand}
                                className="flex items-center gap-2 px-8 py-3 border-2 border-text-main font-bold text-[10px] tracking-[0.3em] uppercase hover:bg-text-main hover:text-primary transition-all"
                            >
                                <span>{expanded ? "Fold Detailed Index" : "Unfold Detailed Index"}</span>
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

                                            {/* Top Section: Heatmap & Languages */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                                                {/* Language Distribution */}
                                                <div>
                                                    <div className="flex items-center gap-3 mb-6 border-b-2 border-text-main pb-3">
                                                        <Book className="w-5 h-5" />
                                                        <h3 className="text-xs font-black tracking-[0.2em] uppercase">Language Capital</h3>
                                                    </div>
                                                    <div className="space-y-6">
                                                        {getLanguageStats().map((lang) => (
                                                            <div key={lang.name}>
                                                                <div className="flex justify-between font-sans text-[10px] font-bold tracking-widest uppercase mb-2">
                                                                    <span>{lang.name}</span>
                                                                    <span>{lang.percentage}%</span>
                                                                </div>
                                                                <div className="h-4 border border-text-main w-full p-0.5 bg-primary">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${lang.percentage}%` }}
                                                                        className="h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxsaW5lIHgxPSIwIiB5MT0iNCIgeDI9IjQiIHkyPSIwIiBzdHJva2U9IiMxMTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-repeat"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {getLanguageStats().length === 0 && (
                                                            <p className="font-serif italic text-sm">No linguistic data recorded.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Heatmap */}
                                                <div>
                                                    <div className="flex items-center gap-3 mb-6 border-b-2 border-text-main pb-3">
                                                        <Calendar className="w-5 h-5" />
                                                        <h3 className="text-xs font-black tracking-[0.2em] uppercase">Volume Matrix</h3>
                                                    </div>
                                                    <div className="overflow-x-auto border-2 border-text-main p-4 bg-primary shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                        {renderHeatmap()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recent Activity Ticker */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-6 border-b-2 border-text-main pb-3">
                                                    <Clock className="w-5 h-5" />
                                                    <h3 className="text-xs font-black tracking-[0.2em] uppercase">Recent Transactions</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {events.slice(0, 6).map((event) => (
                                                        <a
                                                            key={event.id}
                                                            href={`https://github.com/${event.repo.name}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-4 border border-text-main hover:bg-text-main hover:text-primary transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest border border-current px-2 py-1">
                                                                    {formatEventType(event.type)}
                                                                </span>
                                                                <span className="font-serif font-bold truncate max-w-[120px] md:max-w-[160px]">
                                                                    {event.repo.name.split('/')[1] || event.repo.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold tracking-widest uppercase whitespace-nowrap ml-4">
                                                                {new Date(event.created_at).toLocaleDateString()}
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Full Archive */}
                                            <div>
                                                <div className="flex items-center justify-between border-b-[3px] border-text-main pb-4 mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <Book className="w-5 h-5" />
                                                        <h3 className="text-xs font-black tracking-[0.2em] uppercase">Comprehensive Archive</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSortBy('stars')}
                                                            className={`px-3 py-1 text-[10px] tracking-widest uppercase font-bold border border-text-main ${sortBy === 'stars' ? 'bg-text-main text-primary' : 'hover:bg-text-main hover:text-primary transition-colors'}`}
                                                        >
                                                            Yield
                                                        </button>
                                                        <button
                                                            onClick={() => setSortBy('updated')}
                                                            className={`px-3 py-1 text-[10px] tracking-widest uppercase font-bold border border-text-main ${sortBy === 'updated' ? 'bg-text-main text-primary' : 'hover:bg-text-main hover:text-primary transition-colors'}`}
                                                        >
                                                            Date
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {getSortedRepos().map((repo) => (
                                                        <a
                                                            key={repo.name}
                                                            href={repo.html_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex flex-col p-5 border border-text-main bg-primary hover:bg-text-main hover:text-primary transition-all h-full"
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h4 className="font-serif font-bold text-lg leading-tight uppercase truncate flex-1">{repo.name}</h4>
                                                            </div>
                                                            <p className="font-serif text-sm italic mb-6 flex-grow line-clamp-3">
                                                                {repo.description || "No description provided."}
                                                            </p>
                                                            <div className="flex items-center justify-between font-sans text-[10px] font-bold tracking-widest uppercase border-t border-current/30 pt-4">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="flex items-center gap-1">
                                                                        <Star className="w-3.5 h-3.5 fill-current" />
                                                                        {repo.stargazers_count}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <GitFork className="w-3.5 h-3.5" />
                                                                        {repo.forks_count}
                                                                    </span>
                                                                </div>
                                                                <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
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
