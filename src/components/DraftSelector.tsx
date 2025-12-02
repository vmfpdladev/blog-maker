'use client';

import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

interface DraftOption {
    title: string;
    description: string;
}

interface DraftSelectorProps {
    options: DraftOption[];
    onSelect: (index: number) => void;
    isLoading?: boolean;
}

export default function DraftSelector({ options, onSelect, isLoading }: DraftSelectorProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/60 animate-pulse">Generating draft concepts...</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
            {options.map((option, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    onClick={() => onSelect(index)}
                    className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 rounded-2xl p-8 transition-all hover:shadow-2xl hover:shadow-blue-500/20"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-blue-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                            {option.title}
                        </h3>

                        <p className="text-gray-400 leading-relaxed">
                            {option.description}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
