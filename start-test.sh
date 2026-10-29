#!/bin/bash
echo "=== Emoji Rebus Blitz - Local Test Setup ==="
echo

# Check if http-server is installed
if ! command -v http-server &> /dev/null; then
    echo "Installing http-server..."
    npm install -g http-server
fi

# Create a simple API mock server
cat > api-server.js << 'APISERVER'
import { createServer } from 'http';

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
    console.log(\`API: \${req.method} \${req.url}\`);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    try {
        const endpoint = apiEndpoints[req.url];
        if (endpoint) {
            const data = await endpoint(req);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    } catch (error) {
        if (error.message.includes('fields are required') || 
            error.message.includes('must contain at least one emoji')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        } else if (error instanceof SyntaxError) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format' }));
        } else {
            console.error('API error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Server error' }));
        }
    }
});

server.listen(3001, () => {
    console.log('API server running on http://localhost:3001');
});
APISERVER

echo "Starting API server on port 3001..."
node api-server.js &
API_PID=$!

echo "Starting static file server on port 3000..."
http-server public -p 3000 --cors &
HTTP_PID=$!

echo
echo "=== Test Environment Ready ==="
echo "Frontend: http://localhost:3000"
echo "API:      http://localhost:3001"
echo
echo "Test endpoints:"
echo "  GET  http://localhost:3001/api/health"
echo "  GET  http://localhost:3001/api/puzzle"
echo "  POST http://localhost:3001/api/submit"
echo
echo "Sample test:"
echo '  curl -X POST http://localhost:3001/api/submit \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '\''{"emoji":"🕷️🦸‍♂️","answer":"Spider-Man!","hint":"Web-slinger"}'\'''
echo
echo "Press Ctrl+C to stop both servers"
echo

# Wait for Ctrl+C
trap "kill $API_PID $HTTP_PID 2>/dev/null; exit" INT
wait
