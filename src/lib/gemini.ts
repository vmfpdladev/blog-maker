import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function generateBlogPost(topic: string, type: 'informative' | 'clickbait' = 'informative') {
    if (!API_KEY) {
        return {
            title: `[Mock] ${topic} - A Great Read`,
            content: `This is a mock blog post about ${topic}. Real generation requires an API key.`,
            hashtags: ['#mock', `#${topic.replace(/\s+/g, '')}`],
            seoScore: 85,
            seoAnalysis: 'This is a mock analysis. Add an API key for real insights.',
            keywords: ['mock', 'data']
        };
    }

    const prompt = `
    Write a blog post about "${topic}".
    Style: ${type === 'clickbait' ? 'Sensational, exciting, must-click' : 'Educational, detailed, professional'}.
    Structure:
    - Catchy Title
    - Introduction
    - 3 Main Body Paragraphs
    - Conclusion
    - 5 Relevant Hashtags
    
    Also analyze the content for SEO:
    - seoScore: Number 0-100 based on keyword usage, readability, and structure.
    - seoAnalysis: A brief string explaining the score and suggesting improvements.
    - keywords: Array of top 3-5 keywords used.

    Format the output as JSON with keys: title, content, hashtags (array of strings), seoScore (number), seoAnalysis (string), keywords (array of strings).
  `;

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });

        const text = result.text || '';

        // Simple parsing (in production, use structured output or robust JSON parser)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return {
            title: `Post about ${topic}`,
            content: text,
            hashtags: [],
            seoScore: 70,
            seoAnalysis: 'Could not parse SEO analysis.',
            keywords: []
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
