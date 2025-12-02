'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import TrendCard from '@/components/TrendCard';
import { getDailyTrends, TrendItem } from '@/lib/google-trends';

export default function Home() {
    const router = useRouter();
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [customTopic, setCustomTopic] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            try {
                const data = await getDailyTrends();
                setTrends(data);
            } catch (error) {
                console.error('Failed to fetch trends', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTrends();
    }, []);

    const handleSelect = (topic: string) => {
        router.push(`/generate?topic=${encodeURIComponent(topic)}`);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTopic.trim()) {
            handleSelect(customTopic);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white selection:bg-blue-500/30">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="relative max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">AI-Powered Content Engine</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 mb-6 tracking-tight">
                        Blog Post <br />
                        <span className="text-blue-500">Auto-Generator</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Turn trending topics into SEO-optimized blog posts in seconds.
                        Powered by Google Trends & Gemini AI.
                    </p>
                </motion.div>

                <div className="w-full max-w-xl mb-16">
                    <form onSubmit={handleCustomSubmit} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative flex items-center bg-gray-900 rounded-xl border border-gray-800 p-2">
                            <Search className="w-6 h-6 text-gray-500 ml-4" />
                            <input
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="Enter a custom topic..."
                                className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder:text-gray-600 text-lg"
                            />
                            <button
                                type="submit"
                                disabled={!customTopic.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate
                            </button>
                        </div>
                    </form>
                </div>

                <div className="w-full flex justify-center">
                    {isLoading ? (
                        <div className="w-full max-w-md h-64 bg-white/5 animate-pulse rounded-2xl" />
                    ) : (
                        <TrendCard trends={trends} onSelect={handleSelect} />
                    )}
                </div>
            </div>
        </main>
    );
}
