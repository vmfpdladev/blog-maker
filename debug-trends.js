const puppeteer = require('puppeteer');

async function debugGoogleTrends() {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080'
        ]
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to Google Trends...');
        await page.goto('https://trends.google.com/trending?geo=KR', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('Page loaded, waiting a bit...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Take screenshot
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
        console.log('Screenshot saved to debug-screenshot.png');

        // Get page HTML
        const html = await page.content();
        console.log('\n=== Page HTML (first 2000 chars) ===');
        console.log(html.substring(0, 2000));

        // Try to find any elements that might contain trends
        console.log('\n=== Looking for potential trend containers ===');

        const selectors = [
            '.feed-item',
            '[class*="feed"]',
            '[class*="trend"]',
            '[class*="item"]',
            'article',
            '.trending-item',
            '[data-trend]',
            'div[role="article"]'
        ];

        for (const selector of selectors) {
            const count = await page.$$eval(selector, els => els.length).catch(() => 0);
            if (count > 0) {
                console.log(`✓ Found ${count} elements with selector: ${selector}`);

                // Get sample content
                const sample = await page.$$eval(selector, els =>
                    els.slice(0, 2).map(el => ({
                        text: el.textContent?.substring(0, 100),
                        classes: el.className,
                        html: el.innerHTML.substring(0, 200)
                    }))
                ).catch(() => []);

                console.log('  Sample:', JSON.stringify(sample, null, 2));
            }
        }

        // Get all class names on the page
        console.log('\n=== All unique class names (first 50) ===');
        const classes = await page.$$eval('*', els => {
            const classSet = new Set();
            els.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(c => c && classSet.add(c));
                }
            });
            return Array.from(classSet);
        });
        console.log(classes.slice(0, 50).join(', '));

        console.log('\n=== Waiting 10 seconds before closing (check the browser window) ===');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

debugGoogleTrends();
