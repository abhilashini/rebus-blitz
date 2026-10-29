import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const PUBLIC_DIR = join(__dirname, 'public');
const API_DIR = join(__dirname, 'api');

// Mock API endpoints
const apiEndpoints = {
    '/api/health': async () => ({
        status: 'ok',
        ts: new Date().toISOString()
    }),
    
    '/api/puzzle': async () => ({
        emoji: '🌊🏄‍♂️',
        hint: 'Something surfers do'
    }),
    
    '/api/submit': async (req) => {
        let body = '';
        for await (const chunk of req) {
            body += chunk;
        }
        
        const data = JSON.parse(body);
        
        // Validation logic from api/submit.js
        if (!data.emoji || !data.answer || !data.hint) {
            throw new Error('All fields are required.');
        }
        
        const emojiRegex = /[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu;
        if (!emojiRegex.test(data.emoji)) {
            throw new Error('Emoji field must contain at least one emoji.');
        }
        
        const normalizedAnswer = data.answer
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
        
        return {
            success: true,
            message: 'Puzzle received (stub).',
            normalizedAnswer
        };
    }
};

const server = createServer(async (req, res) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    try {
        // Handle API endpoints
        if (req.url.startsWith('/api/')) {
            const endpoint = apiEndpoints[req.url];
            if (endpoint) {
                const data = await endpoint(req);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
            }
            return;
        }
        
        // Serve static files
        let filePath = req.url === '/' ? '/index.html' : req.url;
        filePath = join(PUBLIC_DIR, filePath);
        
        const ext = filePath.split('.').pop().toLowerCase();
        const contentType = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json'
        }[ext] || 'text/plain';
        
        const content = readFileSync(filePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else if (error.message.includes('fields are required') || 
                   error.message.includes('must contain at least one emoji')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format' }));
        } else {
            console.error('Server error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
        }
    }
});

server.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  GET  http://localhost:${PORT}/api/puzzle`);
    console.log(`  POST http://localhost:${PORT}/api/submit`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop`);
});
