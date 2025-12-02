'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { TrendItem } from '@/lib/naver-api';

interface TrendCardProps {
    trends: TrendItem[];
    onSelect: (topic: string) => void;
}

export default function TrendCard({ trends, onSelect }: TrendCardProps) {
    return (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Daily Top Trends</h2>
            </div>

            <div className="space-y-3">
                {trends.map((trend, index) => (
                    <motion.button
                        key={trend.item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelect(trend.item)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-blue-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
                                {trend.rank}
                            </span>
                            <span className="text-white font-medium">{trend.item}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
