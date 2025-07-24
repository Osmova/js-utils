#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

async function createServer() {
    const projectRoot = path.join(__dirname, '..');
    
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url);
        let filePath = path.join(projectRoot, parsedUrl.pathname);
        
        console.log(`📁 Requested: ${req.url} -> ${filePath}`);
        
        // Security check to prevent directory traversal
        if (!filePath.startsWith(projectRoot)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        // Handle ES module imports - if no extension, try .js
        if (!path.extname(filePath) && !fs.existsSync(filePath)) {
            const jsPath = filePath + '.js';
            if (fs.existsSync(jsPath)) {
                filePath = jsPath;
            }
        }
        
        // Special case: handle equal module import issue
        if (parsedUrl.pathname === '/dist/equal') {
            const equalPath = path.join(projectRoot, 'dist', 'objects', 'equal.js');
            if (fs.existsSync(equalPath)) {
                filePath = equalPath;
            }
        }
        
        // Default to index.html if directory is requested
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            const indexJs = path.join(filePath, 'index.js');
            const indexHtml = path.join(filePath, 'index.html');
            if (fs.existsSync(indexJs)) {
                filePath = indexJs;
            } else if (fs.existsSync(indexHtml)) {
                filePath = indexHtml;
            }
        }
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        
        console.log(`✅ Serving: ${filePath}`);
        
        const ext = path.extname(filePath);
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json'
        };
        
        const contentType = mimeTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
    
    return new Promise((resolve) => {
        server.listen(0, 'localhost', () => {
            const port = server.address().port;
            resolve({ server, port });
        });
    });
}

async function runBrowserTests() {
    console.log('🚀 Starting browser tests with Puppeteer...\n');
    
    let browser;
    let server;
    try {
        // Start HTTP server
        const serverInfo = await createServer();
        server = serverInfo.server;
        const port = serverInfo.port;
        
        console.log(`🌐 Started HTTP server on http://localhost:${port}`);
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set up console logging from the page
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'log') {
                console.log(text);
            } else if (type === 'error') {
                console.error('❌', text);
            } else if (type === 'warn') {
                console.warn('⚠️', text);
            }
        });
        
        // Handle page errors
        page.on('pageerror', error => {
            console.error('❌ Page error:', error.message);
        });
        
        // Navigate to the test file
        const testUrl = `http://localhost:${port}/tests/browser-test.html`;
        
        console.log(`📄 Loading test file: ${testUrl}`);
        await page.goto(testUrl, { waitUntil: 'networkidle0' });
        
        // Wait for tests to complete
        console.log('⏳ Waiting for tests to complete...\n');
        
        // Wait for the test results to be available
        await page.waitForFunction(() => {
            return window.testResults !== undefined;
        }, { timeout: 30000 });
        
        // Get test results
        const results = await page.evaluate(() => {
            return {
                passed: window.testResults?.passed || 0,
                failed: window.testResults?.failed || 0,
                total: window.testResults?.total || 0,
                details: window.testResults?.details || []
            };
        });
        
        console.log(`\n📊 Test Results: ${results.passed} passed, ${results.failed} failed (${results.total} total)`);
        
        if (results.failed > 0) {
            console.log('\n❌ Failed tests:');
            results.details.filter(test => !test.passed).forEach(test => {
                console.log(`  - ${test.name}: ${test.error}`);
            });
            process.exit(1);
        } else {
            console.log('🎉 All browser tests passed!');
        }
        
    } catch (error) {
        console.error('❌ Error running browser tests:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
        if (server) {
            server.close();
        }
    }
}

// Run the tests
runBrowserTests().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});