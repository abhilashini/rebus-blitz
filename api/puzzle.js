/**
 * Puzzle endpoint
 * GET /api/puzzle
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    // Stub puzzle data - will be replaced with KV integration in Spec 002
    const puzzle = {
        emoji: '🌊🏄‍♂️',
        hint: 'Something surfers do'
    };
    
    res.status(200).json(puzzle);
}
