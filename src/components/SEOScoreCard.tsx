'use client';

import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface SEOScoreProps {
    score: number;
    keywords: string[];
    suggestions: string[];
}

export default function SEOScoreCard({ score, keywords, suggestions }: SEOScoreProps) {
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-400';
        if (s >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-white">SEO Analysis</h3>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                    {score}/100
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Target Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((kw) => (
                            <span key={kw} className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm border border-gray-700">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Suggestions</h4>
                    <ul className="space-y-2">
                        {suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
