'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I am your automated correspondent. I am equipped to relay information regarding Aryan's engineering projects, technical proficiencies, and professional experience. Send a dispatch to begin.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const savedSessionId = localStorage.getItem('chat_session_id');
        if (savedSessionId) {
            setSessionId(savedSessionId);
            fetchHistory(savedSessionId);
        }
    }, []);

    const fetchHistory = async (sid: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat/history/${sid}`);
            if (res.ok) {
                const data = await res.json();
                if (data.history && data.history.length > 0) {
                    const formattedMessages: Message[] = data.history.map((msg: any) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp)
                    }));
                    setMessages(prev => {
                        const welcomeMsg = prev[0];
                        return [welcomeMsg, ...formattedMessages];
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const botMessageId = (Date.now() + 1).toString();
        const placeholderMessage: Message = {
            id: botMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, placeholderMessage]);

        try {
            const response = await fetch(`${API_BASE_URL}/chat/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    session_id: sessionId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);

                            if (data.session_id) {
                                setSessionId(data.session_id);
                                localStorage.setItem('chat_session_id', data.session_id);
                            }

                            if (data.text) {
                                accumulatedResponse += data.text;
                                setMessages(prev => prev.map(msg =>
                                    msg.id === botMessageId
                                        ? { ...msg, content: accumulatedResponse }
                                        : msg
                                ));
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, content: "Dispatch failure. The telegraph line appears to be disconnected or experiencing interference. Please try your request again." }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-[80vh] md:h-[750px] flex flex-col bg-primary border-4 border-text-main shadow-[8px_8px_0px_#000] overflow-hidden text-text-main font-sans transform transition-all">
            {/* Header */}
            <div className="p-4 md:p-6 border-b-4 border-text-main bg-surface flex items-center justify-between gap-4 relative">
                {/* Vintage stamp detail */}
                <div className="absolute top-2 right-16 border-2 border-text-main/20 rotate-12 p-1 hidden md:block">
                    <div className="border border-text-main/20 text-[8px] font-bold text-text-main/40 uppercase tracking-widest px-2 py-1">
                        Approved Comm
                    </div>
                </div>

                <div className="flex items-center gap-4 z-10">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-text-main bg-primary flex items-center justify-center shadow-[2px_2px_0px_#000]">
                            <Bot className="w-7 h-7 text-text-main" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-text-main flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-text-main rounded-none animate-pulse"></span>
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black font-serif uppercase tracking-tighter text-text-main flex items-center gap-2">
                            Telegraph Assistant
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold font-sans uppercase tracking-[0.2em] text-accent mt-1">
                            Direct Line to Archives
                        </p>
                    </div>
                </div>
                <Link href="/" className="p-2 border-2 border-transparent hover:border-text-main transition-colors text-accent hover:text-text-main bg-primary z-10" aria-label="Close exchange">
                    <X className="w-6 h-6" />
                </Link>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth bg-primary relative"
            >
                {/* Background watermark/texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxsaW5lIHgxPSIwIiB5MT0iNCIgeDI9IjQiIHkyPSIwIiBzdHJva2U9IiMxMTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-repeat z-0"></div>

                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex relative z-10 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-start gap-4 max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 border-text-main shadow-[2px_2px_0px_#000] bg-surface`}>
                                {message.role === 'user' ? <User className="w-5 h-5 text-text-main" /> : <Bot className="w-5 h-5 text-text-main" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1 px-1 min-h-[16px]">
                                    {message.role === 'user' ? 'Sender' : 'Operator'} {isMounted ? `— ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                </div>
                                <div className={`p-4 border-2 border-text-main font-serif text-sm md:text-base leading-relaxed ${message.role === 'user'
                                    ? 'bg-text-main text-primary rounded-bl-xl rounded-tl-xl rounded-tr-sm shadow-[4px_4px_0px_#888]'
                                    : 'bg-surface text-text-main rounded-br-xl rounded-tr-xl rounded-tl-sm shadow-[4px_4px_0px_#000]'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start relative z-10"
                    >
                        <div className="flex items-start gap-4 max-w-[85%]">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0 border-2 border-text-main shadow-[2px_2px_0px_#000] bg-surface">
                                <Bot className="w-5 h-5 text-text-main" />
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1 px-1">
                                    Operator
                                </div>
                                <div className="p-4 border-2 border-text-main bg-surface rounded-br-xl rounded-tr-xl rounded-tl-sm shadow-[4px_4px_0px_#000] flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-text-main" />
                                    <span className="font-serif text-sm font-bold italic uppercase tracking-wider">Decoding incoming signal...</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-surface border-t-4 border-text-main relative z-20">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Draft your dispatch here..."
                        className="w-full bg-primary text-text-main placeholder-accent border-2 border-text-main py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-text-main font-serif shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-text-main border-2 border-text-main text-primary hover:bg-surface hover:text-text-main disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold tracking-[0.1em] uppercase text-xs flex items-center justify-center"
                    >
                        <span className="hidden md:inline mr-2">Send</span>
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                <div className="text-center mt-3 text-[9px] font-bold tracking-[0.3em] uppercase text-accent border-t border-text-main/20 pt-2">
                    Transmission secured via AES-256 standard
                </div>
            </div>
        </div>
    );
}
