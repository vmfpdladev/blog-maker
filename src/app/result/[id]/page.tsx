'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Download, Copy, Check, Twitter, Facebook } from 'lucide-react';
import SEOScoreCard from '@/components/SEOScoreCard';
import ImageWithLoading from '@/components/ImageWithLoading';
import { generateBlogPost } from '@/lib/gemini';

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topic = searchParams.get('topic');
    const title = searchParams.get('title');

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [thumbnailType, setThumbnailType] = useState<'informative' | 'clickbait'>('informative');
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (!topic) return;

        async function createPost() {
            setLoading(true);
            try {
                // Use the selected title if available, otherwise topic
                const data = await generateBlogPost(title || topic!, thumbnailType);
                setPost(data);

                // Generate shareable URL
                const currentUrl = window.location.href;
                setShareUrl(currentUrl);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        createPost();
    }, [topic, title, thumbnailType]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl || window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const handleShare = (platform: 'twitter' | 'facebook') => {
        const url = encodeURIComponent(shareUrl || window.location.href);
        const text = encodeURIComponent(post?.title || '');

        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xl font-medium animate-pulse">Writing your masterpiece...</p>
                <p className="text-gray-500 text-sm">Optimizing for SEO • Generating Images • Crafting Tags</p>
            </div>
        );
    }

    if (!post) return null;

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen">
                {/* Sidebar Controls */}
                <div className="lg:w-80 border-r border-gray-800 p-6 flex flex-col gap-8 bg-gray-900/50 backdrop-blur-xl fixed lg:relative h-full z-10">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Start Over
                    </button>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Thumbnail Style</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setThumbnailType('informative')}
                                    className={`p-3 rounded-lg text-sm font-medium transition-all ${thumbnailType === 'informative'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    Informative
                                </button>
                                <button
                                    onClick={() => setThumbnailType('clickbait')}
                                    className={`p-3 rounded-lg text-sm font-medium transition-all ${thumbnailType === 'clickbait'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    Click-bait
                                </button>
                            </div>
                        </div>

                        <SEOScoreCard
                            score={post.seoScore || 0}
                            keywords={post.keywords || []}
                            suggestions={[post.seoAnalysis || 'No analysis available']}
                        />

                        <div className="pt-6 border-t border-gray-800">
                            <button className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors mb-3">
                                <Download className="w-4 h-4" />
                                Export Markdown
                            </button>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Share Article</h3>

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white font-medium py-3 rounded-xl hover:bg-gray-700 transition-colors"
                                >
                                    {linkCopied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </>
                                    )}
                                </button>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="flex items-center justify-center gap-2 bg-blue-500 text-white font-medium py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <Twitter className="w-4 h-4" />
                                        Twitter
                                    </button>
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="flex items-center justify-center gap-2 bg-blue-700 text-white font-medium py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
                                    >
                                        <Facebook className="w-4 h-4" />
                                        Facebook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Preview */}
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto bg-white text-black rounded-xl shadow-2xl overflow-hidden min-h-[800px]"
                    >
                        {/* Mock Thumbnail */}
                        <div className={`h-64 w-full ${thumbnailType === 'clickbait' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} flex items-center justify-center text-white text-4xl font-black p-8 text-center`}>
                            {post.title}
                        </div>

                        <div className="p-12 prose prose-lg max-w-none">
                            <h1>{post.title}</h1>
                            <div className="flex gap-2 mb-8 not-prose">
                                {post.hashtags?.map((tag: string) => (
                                    <span key={tag} className="text-blue-600 font-medium">#{tag}</span>
                                ))}
                            </div>

                            <div className="font-serif space-y-6">
                                {post.paragraphs && Array.isArray(post.paragraphs) ? (
                                    post.paragraphs.map((paragraph: any, index: number) => (
                                        <div key={index} className="space-y-4">
                                            {paragraph.imageUrl && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="w-full rounded-lg overflow-hidden my-6"
                                                >
                                                    <ImageWithLoading
                                                        src={paragraph.imageUrl}
                                                        alt={paragraph.imageDescription || post.title}
                                                    />
                                                </motion.div>
                                            )}
                                            <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                                {paragraph.text || paragraph}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="whitespace-pre-wrap">
                                        {post.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
            <ResultContent />
        </Suspense>
    );
}
