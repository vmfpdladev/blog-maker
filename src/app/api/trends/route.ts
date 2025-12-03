import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface TrendItem {
    item: string;
    rank: number;
    traffic?: string;
    link?: string;
    pubDate?: string;
}

export async function GET() {
    const startTime = Date.now();
    console.log('[API] ===== Starting Google Trends fetch =====');
    console.log('[API] Platform:', process.platform);
    console.log('[API] Current working directory:', process.cwd());

    try {
        // Get the path to the Python script
        const scriptPath = path.join(process.cwd(), 'scripts', 'fetch_trends.py');
        console.log('[API] Python script path:', scriptPath);
        
        // Try to find Python executable
        let pythonCmd: string | null = null;
        
        // Known Python installation paths (Windows)
        const knownPythonPaths = [
            'C:\\Users\\student\\AppData\\Local\\Programs\\Python\\Python314\\python.exe',
            'C:\\Users\\student\\AppData\\Local\\Programs\\Python\\Python314\\pythonw.exe',
        ];
        
        const pythonCommands = process.platform === 'win32' 
            ? ['python', 'py', 'python3', 'python.exe'] 
            : ['python3', 'python'];
        
        console.log('[API] Trying to find Python executable...');
        console.log('[API] Platform:', process.platform);
        console.log('[API] PATH:', process.env.PATH?.substring(0, 200) + '...');
        
        // Step 1: Try known Python paths first (most reliable)
        console.log('[API] Step 1: Trying known Python installation paths...');
        for (const pythonPath of knownPythonPaths) {
            try {
                console.log(`[API] Testing Python at: ${pythonPath}`);
                await execAsync(`"${pythonPath}" --version`);
                pythonCmd = pythonPath;
                console.log(`[API] ✅ Found Python at known path: ${pythonCmd}`);
                break;
            } catch (error: any) {
                console.log(`[API] ❌ ${pythonPath} not found or not working`);
                continue;
            }
        }
        
        // Step 2: Try to find Python using 'where' (Windows) or 'which' (Unix)
        // This works even if PATH is not properly set in the current environment
        if (!pythonCmd) {
            console.log('[API] Step 2: Trying to locate Python using system commands...');
            try {
                const findCmd = process.platform === 'win32' ? 'where python' : 'which python3';
                console.log(`[API] Executing: ${findCmd}`);
                const { stdout: pythonPath } = await execAsync(findCmd);
                if (pythonPath && pythonPath.trim()) {
                    const paths = pythonPath.trim().split('\n').filter(p => p.trim());
                    // Use the first valid path
                    for (const path of paths) {
                        const trimmedPath = path.trim();
                        try {
                            console.log(`[API] Testing Python at: ${trimmedPath}`);
                            await execAsync(`"${trimmedPath}" --version`);
                            pythonCmd = trimmedPath;
                            console.log(`[API] ✅ Found Python using 'where/which': ${pythonCmd}`);
                            break;
                        } catch (testError) {
                            console.log(`[API] ❌ Path ${trimmedPath} is not valid`);
                            continue;
                        }
                    }
                }
            } catch (findError: any) {
                console.log('[API] Could not locate Python using where/which:', findError.message);
            }
        }
        
        // Step 3: Try each Python command in order
        if (!pythonCmd) {
            console.log('[API] Step 3: Trying Python commands in order...');
            for (const cmd of pythonCommands) {
                try {
                    console.log(`[API] Testing command: ${cmd}`);
                    await execAsync(`${cmd} --version`);
                    pythonCmd = cmd;
                    console.log(`[API] ✅ Found Python: ${cmd}`);
                    break;
                } catch (error: any) {
                    console.log(`[API] ❌ ${cmd} not found`);
                    continue;
                }
            }
        }
        
        if (!pythonCmd) {
            console.error('[API] Python not found');
            console.error('[API] Tried known paths:', knownPythonPaths);
            console.error('[API] Tried commands:', pythonCommands);
            console.error('[API] Tried system commands: where/which');
            throw new Error(`Python not found. Please install Python and ensure it's in your PATH.`);
        }
        
        console.log('[API] ✅ Using Python command:', pythonCmd);
        
        const fullCommand = `${pythonCmd} "${scriptPath}"`;
        console.log('[API] Executing command:', fullCommand);
        
        // Execute the Python script with timeout
        const execStartTime = Date.now();
        let stdout: string, stderr: string;
        try {
            const result = await Promise.race([
                execAsync(fullCommand),
                new Promise<{ stdout: string; stderr: string }>((_, reject) => 
                    setTimeout(() => reject(new Error('Script execution timeout (30s)')), 30000)
                )
            ]);
            stdout = result.stdout;
            stderr = result.stderr || '';
        } catch (execError: any) {
            console.error('[API] Script execution failed:', execError.message);
            if (execError.code === 'ENOENT') {
                throw new Error(`Python command '${pythonCmd}' not found. Please install Python.`);
            }
            throw execError;
        }
        const execDuration = Date.now() - execStartTime;
        
        console.log('[API] Python script execution time:', execDuration, 'ms');
        console.log('[API] stdout length:', stdout.length);
        console.log('[API] stderr length:', stderr?.length || 0);
        
        if (stderr) {
            // Log all stderr (includes debug logs)
            const stderrLines = stderr.split('\n').filter(line => line.trim());
            console.log('[API] Python stderr output:');
            stderrLines.forEach(line => {
                if (line.includes('[DEBUG]')) {
                    console.log('[PYTHON DEBUG]', line);
                } else if (!line.includes('WARNING') && !line.includes('DeprecationWarning')) {
                    console.warn('[PYTHON WARNING]', line);
                }
            });
        }

        console.log('[API] Parsing JSON from stdout...');
        let data;
        try {
            data = JSON.parse(stdout);
            console.log('[API] JSON parsed successfully');
        } catch (parseError: any) {
            console.error('[API] JSON parse error:', parseError.message);
            console.error('[API] stdout content:', stdout.substring(0, 500));
            throw new Error(`Failed to parse JSON: ${parseError.message}`);
        }
        
        // Check if there's an error in the response
        if (data.error) {
            console.warn('[API] Python script returned error:', data.error);
            if (data.traceback) {
                console.error('[API] Python traceback:', data.traceback);
            }
            throw new Error(data.error);
        }

        const trends: TrendItem[] = data.trends || data;
        console.log('[API] Extracted trends:', trends.length, 'items');
        console.log('[API] Trends data:', JSON.stringify(trends, null, 2));

        if (trends.length === 0) {
            console.warn('[API] No trends found in response');
            throw new Error('No trends found from API');
        }

        const totalDuration = Date.now() - startTime;
        console.log('[API] ===== Successfully fetched trends in', totalDuration, 'ms =====');
        
        // Return top 10 trends
        return NextResponse.json(trends.slice(0, 10));

    } catch (error: any) {
        const totalDuration = Date.now() - startTime;
        console.error('[API] ===== Error after', totalDuration, 'ms =====');
        console.error('[API] Error type:', error.constructor?.name || typeof error);
        console.error('[API] Error message:', error.message);
        if (error.code) {
            console.error('[API] Error code:', error.code);
        }
        if (error.stderr) {
            console.error('[API] Error stderr:', error.stderr);
        }
        if (error.stdout) {
            console.error('[API] Error stdout:', error.stdout);
        }
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
