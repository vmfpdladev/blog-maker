export interface TrendItem {
    item: string;
    rank: number;
    traffic?: string;
    link?: string;
    pubDate?: string;
}

export async function getDailyTrends(): Promise<TrendItem[]> {
    try {
        const response = await fetch('/api/trends', {
            cache: 'no-store' // Always get fresh data
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trends');
        }

        const trends = await response.json();
        return trends;
    } catch (error) {
        console.error('Error fetching Google Trends:', error);

        // Return mock data as fallback
        return getMockTrends();
    }
}

function getMockTrends(): TrendItem[] {
    return [
        { rank: 1, item: 'AI Technology' },
        { rank: 2, item: 'Sustainable Living' },
        { rank: 3, item: 'Healthy Recipes' },
        { rank: 4, item: 'Remote Work Tips' },
        { rank: 5, item: 'Budget Travel' },
    ];
}