/**
 * Submission endpoint with validation
 * POST /api/submit
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const body = await parseBody(req);
        
        // Validate required fields
        if (!body.emoji || !body.answer || !body.hint) {
            return res.status(400).json({ 
                error: 'All fields are required.' 
            });
        }
        
        // Check for emoji presence
        if (!containsEmoji(body.emoji)) {
            return res.status(400).json({ 
                error: 'Emoji field must contain at least one emoji.' 
            });
        }
        
        // Normalize answer
        const normalizedAnswer = normalizeAnswer(body.answer);
        
        // Log submission (for now - will write to KV in Spec 002)
        console.log('Puzzle submission received:', {
            emoji: body.emoji,
            originalAnswer: body.answer,
            normalizedAnswer,
            hint: body.hint
        });
        
        // Return success with normalized answer
        res.status(200).json({
            success: true,
            message: 'Puzzle received (stub).',
            normalizedAnswer
        });
        
    } catch (error) {
        console.error('Submission error:', error);
        res.status(400).json({ error: 'Invalid request format' });
    }
}

/**
 * Parse request body
 */
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

/**
 * Check if string contains at least one emoji
 */
function containsEmoji(text) {
    // Simple emoji detection using Unicode ranges
    // This covers most common emojis but could be expanded
    const emojiRegex = /[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu;
    return emojiRegex.test(text);
}

/**
 * Normalize answer string
 * - Convert to lowercase
 * - Remove non-alphanumeric characters (except spaces)
 */
function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')  // Remove non-alphanumeric (keep spaces)
        .trim();
}
