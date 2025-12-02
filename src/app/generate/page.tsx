'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import DraftSelector from '@/components/DraftSelector';
import { generateDraftOptions } from '@/lib/gemini';

function GenerateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topic = searchParams.get('topic');

    const [drafts, setDrafts] = useState<{ title: string, description: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!topic) {
            router.push('/');
            return;
        }

        async function fetchDrafts() {
            try {
                const options = await generateDraftOptions(topic!);
                setDrafts(options);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchDrafts();
    }, [topic, router]);

    const handleSelect = (index: number) => {
        // In a real app, we might pass the selected draft details or just the index/ID
        // For now, let's pass the title as the refined topic
        const selectedDraft = drafts[index];
        router.push(`/result/new?topic=${encodeURIComponent(topic!)}&title=${encodeURIComponent(selectedDraft.title)}`);
    };

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Choose Your Angle
                        </h1>
                        <p className="text-gray-400">
                            We generated two different approaches for <span className="text-blue-400">"{topic}"</span>.
                            <br />Select the one that fits your goal.
                        </p>
                    </motion.div>

                    <DraftSelector
                        options={drafts}
                        isLoading={loading}
                        onSelect={handleSelect}
                    />
                </div>
            </div>
        </main>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
            <GenerateContent />
        </Suspense>
    );
}
