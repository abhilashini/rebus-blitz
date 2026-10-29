/**
 * Puzzle endpoint with KV integration
 * GET /api/puzzle
 */
import { puzzleManager } from '../lib/kv-puzzle-manager.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Fetch random puzzle from KV
    const puzzle = await puzzleManager.fetchRandomPuzzle();
    
    // Return only emoji and hint to frontend (don't expose answer)
    res.status(200).json({
      emoji: puzzle.emoji,
      hint: puzzle.hint,
      // Include puzzle ID for debugging/tracking
      id: puzzle.id,
    });
    
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    
    if (error.message.includes('No puzzles available')) {
      res.status(404).json({ 
        error: 'No puzzles available. Please submit a puzzle first!' 
      });
    } else {
      // Use fallback puzzle
      const fallbackPuzzle = puzzleManager.getFallbackPuzzle();
      res.status(200).json({
        emoji: fallbackPuzzle.emoji,
        hint: fallbackPuzzle.hint,
        id: 'fallback',
        note: 'Using fallback puzzle due to database error',
      });
    }
  }
}
