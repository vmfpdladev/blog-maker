const googleTrends = require('google-trends-api');

async function testGoogleTrends() {
    console.log('Testing Google Trends API...\n');

    try {
        console.log('Fetching daily trends for Korea (KR)...');
        const results = await googleTrends.dailyTrends({
            geo: 'KR',
        });

        console.log('\n✓ Raw results received');

        const data = JSON.parse(results);
        console.log('✓ Data parsed successfully\n');

        const trendingSearches = data?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

        console.log(`Found ${trendingSearches.length} trending searches\n`);
        console.log('=== Top 10 Trends ===\n');

        const trends = trendingSearches.slice(0, 10).map((trend, index) => {
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

        trends.forEach(trend => {
            console.log(`${trend.rank}. ${trend.item}`);
            if (trend.traffic) console.log(`   Traffic: ${trend.traffic}`);
            if (trend.link) console.log(`   Link: ${trend.link.substring(0, 80)}...`);
            console.log('');
        });

        console.log('\n=== Full JSON Output ===\n');
        console.log(JSON.stringify(trends, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
    }
}

testGoogleTrends();
