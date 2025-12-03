const puppeteer = require('puppeteer');

async function testGoogleTrendsAPI() {
    console.log('Testing Google Trends Internal API...\n');

    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920,1080'
            ]
        });

        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to Google Trends...');
        await page.goto('https://trends.google.com/trending?geo=KR', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log('Waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Fetching trends data from internal API...');
        const apiUrl = 'https://trends.google.com/trends/api/dailytrends?hl=ko&tz=-540&geo=KR&ns=15';

        const response = await page.goto(apiUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        if (!response) {
            throw new Error('No response from API');
        }

        const responseText = await response.text();
        console.log('✓ Response received, length:', responseText.length);
        console.log('\nFirst 200 chars:', responseText.substring(0, 200));

        // The response starts with ")]}'" which we need to remove
        const jsonText = responseText.replace(/^\)\]\}',?\n?/, '');
        const data = JSON.parse(jsonText);

        console.log('\n✓ Data parsed successfully\n');

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

        await browser.close();

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        if (browser) {
            await browser.close();
        }
    }
}

testGoogleTrendsAPI();
