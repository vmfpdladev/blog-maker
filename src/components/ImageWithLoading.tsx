'use client';

import { useState } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface ImageWithLoadingProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ImageWithLoading({ src, alt, className = '' }: ImageWithLoadingProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={`relative min-h-[300px] bg-gray-900 flex items-center justify-center ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm text-white z-10">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
                    <span className="text-sm font-medium animate-pulse text-blue-200">이미지 생성 중...</span>
                </div>
            )}

            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-auto object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError(true);
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 p-8">
                    <ImageOff className="w-10 h-10 mb-2" />
                    <span className="text-sm">이미지를 불러올 수 없습니다</span>
                </div>
            )}
        </div>
    );
}
