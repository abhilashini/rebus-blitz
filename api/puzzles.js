/**
 * Community Puzzles Endpoint
 * GET /api/puzzles
 * Returns latest community puzzles stored in KV
 */
import { puzzleManager } from '../lib/kv-puzzle-manager.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  try {
    const communityPuzzles = await puzzleManager.fetchAllPuzzles(50);
    res.status(200).json({
      success: true,
      count: communityPuzzles.length,
      puzzles: communityPuzzles
    });
  } catch (err) {
    console.error('Error in /api/puzzles:', err);
    res.status(200).json({
      success: false,
      count: 0,
      puzzles: [],
      error: err.message
    });
  }
}
