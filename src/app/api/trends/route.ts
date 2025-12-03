import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export interface TrendItem {
    item: string;
    rank: number;
    traffic?: string;
    link?: string;
}

export async function GET() {
    const startTime = Date.now();
    console.log('[API] ===== Starting Google Trends fetch =====');

    let browser;
    try {
        console.log('[API] Launching Puppeteer browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });

        const page = await browser.newPage();

        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('[API] Navigating to Google Trends...');

        // Navigate to the page first to get cookies
        await page.goto('https://trends.google.com/trending?geo=KR', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log('[API] Waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Now try to fetch the internal API endpoint
        console.log('[API] Fetching trends data from internal API...');
        const apiUrl = 'https://trends.google.com/trends/api/dailytrends?hl=ko&tz=-540&geo=KR&ns=15';

        const response = await page.goto(apiUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        if (!response) {
            throw new Error('No response from API');
        }

        const responseText = await response.text();
        console.log('[API] Response received, length:', responseText.length);

        // The response starts with ")]}'" which we need to remove
        const jsonText = responseText.replace(/^\)\]\}',?\n?/, '');
        const data = JSON.parse(jsonText);

        console.log('[API] Data parsed successfully');

        // Extract trending searches
        const trendingSearches = data?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

        console.log('[API] Found', trendingSearches.length, 'trending searches');

        // Transform to our format
        const trends: TrendItem[] = trendingSearches.slice(0, 10).map((trend: any, index: number) => {
            const title = trend.title?.query || '';
            const formattedTraffic = trend.formattedTraffic || '';
            const articleUrl = trend.articles?.[0]?.url || '';

            return {
                rank: index + 1,
                item: title,
                traffic: formattedTraffic || undefined,
                link: articleUrl || undefined
            };
        });

        await browser.close();

        console.log('[API] Transformed trends:', JSON.stringify(trends.slice(0, 3), null, 2));

        if (trends.length === 0) {
            console.warn('[API] No trends found in response');
            throw new Error('No trends found from Google Trends');
        }

        const totalDuration = Date.now() - startTime;
        console.log('[API] ===== Successfully fetched trends in', totalDuration, 'ms =====');

        return NextResponse.json(trends);

    } catch (error: any) {
        if (browser) {
            await browser.close();
        }

        const totalDuration = Date.now() - startTime;
        console.error('[API] ===== Error after', totalDuration, 'ms =====');
        console.error('[API] Error type:', error.constructor?.name || typeof error);
        console.error('[API] Error message:', error.message);
        if (error.stack) {
            console.error('[API] Error stack:', error.stack);
        }

        // Return mock data as fallback with error info
        console.log('[API] Returning mock data as fallback');
        const mockTrends: TrendItem[] = [
            { rank: 1, item: 'AI 기술' },
            { rank: 2, item: '지속 가능한 생활' },
            { rank: 3, item: '건강한 레시피' },
            { rank: 4, item: '재택근무 팁' },
            { rank: 5, item: '저예산 여행' },
        ];

        // Include error info in response headers for debugging
        const response = NextResponse.json(mockTrends);
        response.headers.set('X-Trends-Error', encodeURIComponent(error.message || 'Unknown error'));
        response.headers.set('X-Trends-Source', 'mock-fallback');
        return response;
    }
}
