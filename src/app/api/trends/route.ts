import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

export interface TrendItem {
    item: string;
    rank: number;
}

export async function GET() {
    try {
        console.log('Fetching Google Trends using google-trends-api...');

        // Fetch daily trends for Korea
        // dailyTrends returns a Promise that resolves to a JSON string
        const response = await googleTrends.dailyTrends({
            geo: 'KR',
        });

        const data = JSON.parse(response);
        console.log('Google Trends API response received');

        const trends: TrendItem[] = [];

        // Parse the response structure
        // default -> trendingSearchesDays -> [0] -> trendingSearches
        if (data.default && data.default.trendingSearchesDays && data.default.trendingSearchesDays.length > 0) {
            const dailyData = data.default.trendingSearchesDays[0];
            const trendingSearches = dailyData.trendingSearches;

            trendingSearches.forEach((search: any, index: number) => {
                if (index < 5) {
                    trends.push({
                        rank: index + 1,
                        item: search.title.query
                    });
                }
            });
        }

        console.log('Successfully parsed trends:', trends);

        if (trends.length === 0) {
            throw new Error('No trends found from API');
        }

        return NextResponse.json(trends);

    } catch (error) {
        console.error('Error fetching Google Trends:', error);

        // Return mock data as fallback
        const mockTrends: TrendItem[] = [
            { rank: 1, item: 'AI 기술' },
            { rank: 2, item: '지속 가능한 생활' },
            { rank: 3, item: '건강한 레시피' },
            { rank: 4, item: '재택근무 팁' },
            { rank: 5, item: '저예산 여행' },
        ];

        return NextResponse.json(mockTrends);
    }
}
