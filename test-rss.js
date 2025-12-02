// const fetch = require('node-fetch');

async function testRSS() {
    try {
        console.log('Fetching RSS feed...');
        const response = await fetch('https://trends.google.com/trending/rss?geo=KR', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log('Status:', response.status);
        if (!response.ok) {
            console.error('Failed to fetch');
            return;
        }

        const text = await response.text();
        console.log('Content length:', text.length);
        console.log('Preview:', text.substring(0, 200));

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/;

        let match;
        let count = 0;
        while ((match = itemRegex.exec(text)) !== null && count < 5) {
            const itemContent = match[1];
            const titleMatch = titleRegex.exec(itemContent);
            if (titleMatch) {
                console.log(`Trend ${count + 1}:`, titleMatch[1]);
                count++;
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testRSS();
