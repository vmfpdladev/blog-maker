// Test Python script execution directly
const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testPythonScript() {
    const scriptPath = path.join(__dirname, 'scripts', 'fetch_trends.py');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    console.log('Testing Python script execution...');
    console.log('Python command:', pythonCmd);
    console.log('Script path:', scriptPath);
    
    // First check if Python is available
    try {
        console.log('\n1. Checking Python installation...');
        const { stdout: version } = await execAsync(`${pythonCmd} --version`);
        console.log('✅ Python found:', version.trim());
    } catch (error) {
        console.error('❌ Python not found:', error.message);
        console.error('Please install Python from https://www.python.org/');
        return;
    }
    
    // Check if pytrends is installed
    try {
        console.log('\n2. Checking pytrends installation...');
        await execAsync(`${pythonCmd} -c "import pytrends; print('pytrends version:', pytrends.__version__)"`);
        console.log('✅ pytrends is installed');
    } catch (error) {
        console.error('❌ pytrends not installed');
        console.error('Please run: pip install pytrends');
        return;
    }
    
    // Execute the script
    try {
        console.log('\n3. Executing fetch_trends.py...');
        const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`);
        
        if (stderr) {
            console.log('\nStderr output:');
            console.log(stderr);
        }
        
        console.log('\nStdout output:');
        console.log(stdout);
        
        try {
            const data = JSON.parse(stdout);
            if (data.error) {
                console.error('\n❌ Script returned error:', data.error);
                if (data.traceback) {
                    console.error('\nTraceback:');
                    console.error(data.traceback);
                }
            } else {
                console.log('\n✅ Script executed successfully!');
                console.log(`Found ${data.trends?.length || 0} trends`);
                if (data.trends && data.trends.length > 0) {
                    console.log('\nSample trends:');
                    data.trends.slice(0, 3).forEach(t => {
                        console.log(`  ${t.rank}. ${t.item}`);
                    });
                }
            }
        } catch (parseError) {
            console.error('\n❌ Failed to parse JSON output');
            console.error('Raw output:', stdout);
        }
    } catch (error) {
        console.error('\n❌ Script execution failed:', error.message);
        if (error.stderr) {
            console.error('Stderr:', error.stderr);
        }
        if (error.stdout) {
            console.error('Stdout:', error.stdout);
        }
    }
}

testPythonScript().catch(console.error);









