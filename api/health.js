/**
 * Health check endpoint with KV status
 * GET /api/health
 */
import { checkKVHealth } from '../lib/kv-client.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const kvHealth = await checkKVHealth();
    
    const healthResponse = {
      status: 'ok',
      ts: new Date().toISOString(),
      kvStatus: kvHealth.status,
      connected: kvHealth.connected,
      puzzleCount: kvHealth.puzzleCount,
      mode: kvHealth.mode,
    };
    
    // If there's an error in fallback mode, include it
    if (kvHealth.error && kvHealth.mode === 'fallback') {
      healthResponse.kvError = kvHealth.error;
    }
    
    res.status(200).json(healthResponse);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      ts: new Date().toISOString(),
      error: 'Internal server error during health check',
    });
  }
}
