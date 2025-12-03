import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

const genAI = new GoogleGenAI({ apiKey: API_KEY });

interface ParagraphWithImage {
    text: string;
    imageUrl?: string;
    imageDescription?: string;
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
    if (!UNSPLASH_ACCESS_KEY) {
        // Return placeholder if no API key
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=600&nologo=true`;
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                }
            }
        );

        if (!response.ok) {
            // Fallback to placeholder
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=600&nologo=true`;
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }
    } catch (error) {
        console.error('Error fetching Unsplash image:', error);
    }

    // Fallback to placeholder
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=600&nologo=true`;
}

async function generateImageQueries(content: string, topic: string): Promise<string[]> {
    if (!API_KEY) {
        return [];
    }

    const prompt = `
    Given the following blog post content about "${topic}", generate 3-5 short English search queries (2-4 words each) for finding appropriate images.
    Each query should match the theme of different paragraphs in the content.
    Return as a JSON array of strings.
    
    Content:
    ${content.substring(0, 1000)}
    `;

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });

        const text = result.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Error generating image queries:', error);
    }

    // Fallback queries
    return [topic, `${topic} concept`, `${topic} illustration`];
}

export async function generateBlogPost(topic: string, type: 'informative' | 'clickbait' = 'informative') {
    if (!API_KEY) {
        return {
            title: `[Mock] ${topic} - A Great Read`,
            content: `This is a mock blog post about ${topic}. Real generation requires an API key.`,
            paragraphs: [
                { text: `This is a mock blog post about ${topic}. Real generation requires an API key.` }
            ],
            hashtags: ['#mock', `#${topic.replace(/\s+/g, '')}`],
            seoScore: 85,
            seoAnalysis: 'This is a mock analysis. Add an API key for real insights.',
            keywords: ['mock', 'data']
        };
    }

    const prompt = `
    Write a blog post about "${topic}" in Korean (한국어).
    Style: ${type === 'clickbait' ? 'Sensational, exciting, must-click' : 'Educational, detailed, professional'}.
    Structure:
    - Catchy Title (in Korean)
    - Introduction paragraph
    - 3 Main Body Paragraphs (each should be substantial, 3-5 sentences)
    - Conclusion paragraph
    - 5 Relevant Hashtags (in Korean)
    
    Also analyze the content for SEO:
    - seoScore: Number 0-100 based on keyword usage, readability, and structure.
    - seoAnalysis: A brief string explaining the score and suggesting improvements (in Korean).
    - keywords: Array of top 3-5 keywords used (in Korean).

    IMPORTANT: Format the content as an array of paragraphs. Each paragraph should be separated clearly.
    Format the output as JSON with keys: title, content (full text), paragraphs (array of paragraph strings), hashtags (array of strings), seoScore (number), seoAnalysis (string), keywords (array of strings).
  `;

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });

        const text = result.text || '';

        // Simple parsing (in production, use structured output or robust JSON parser)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let postData;

        if (jsonMatch) {
            postData = JSON.parse(jsonMatch[0]);
        } else {
            postData = {
                title: `Post about ${topic}`,
                content: text,
                paragraphs: text.split('\n\n').filter(p => p.trim().length > 0),
                hashtags: [],
                seoScore: 70,
                seoAnalysis: 'Could not parse SEO analysis.',
                keywords: []
            };
        }

        // Ensure paragraphs array exists
        if (!postData.paragraphs || postData.paragraphs.length === 0) {
            // Split content into paragraphs
            postData.paragraphs = postData.content
                ? postData.content.split('\n\n').filter((p: string) => p.trim().length > 0)
                : [];
        }

        // Generate image queries and fetch images
        const imageQueries = await generateImageQueries(postData.content || '', topic);
        const paragraphsWithImages: ParagraphWithImage[] = [];

        for (let i = 0; i < postData.paragraphs.length; i++) {
            const paragraph = postData.paragraphs[i];
            const imageQuery = imageQueries[i % imageQueries.length] || topic;

            // Fetch image for every other paragraph (or every paragraph if less than 3)
            if (i === 0 || i % 2 === 0 || postData.paragraphs.length < 3) {
                const imageUrl = await fetchUnsplashImage(imageQuery);
                paragraphsWithImages.push({
                    text: paragraph,
                    imageUrl: imageUrl || undefined,
                    imageDescription: imageQuery
                });
            } else {
                paragraphsWithImages.push({
                    text: paragraph
                });
            }
        }

        return {
            ...postData,
            paragraphs: paragraphsWithImages
        };
    } catch (error) {
        console.error('Gemini generation error:', error);
        throw error;
    }
}

export async function generateDraftOptions(topic: string) {
    // Generate 2 distinct angles/titles for the user to choose from
    if (!API_KEY) {
        return [
            { title: `Why ${topic} is Changing the World`, description: 'A deep dive into the impact.' },
            { title: `10 Secrets about ${topic}`, description: 'Things you never knew.' }
        ];
    }

    const prompt = `Generate 2 distinct blog post angles for the topic "${topic}". 
    Write in Korean (한국어).
    Return JSON array of objects with 'title' and 'description'.`;

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });

        const text = result.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
