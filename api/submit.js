/**
 * Submission endpoint with KV storage
 * POST /api/submit
 */
import { puzzleManager } from '../lib/kv-puzzle-manager.js';
import { validateSubmission } from '../lib/validation.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
    return;
  }
  
  try {
    // Parse request body (supports both pre-parsed req.body and raw stream)
    let data = req.body;
    if (typeof data !== 'object' || data === null) {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      data = JSON.parse(body || '{}');
    }
    
    // Validate submission
    const validation = validateSubmission(data);
    
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        errors: validation.errors,
        message: 'Validation failed',
      });
      return;
    }
    
    // Store puzzle in KV
    const storageResult = await puzzleManager.storePuzzle(validation.normalizedData);
    
    if (!storageResult.success) {
      console.error('Failed to store puzzle:', storageResult);
      res.status(500).json({
        success: false,
        error: 'Failed to save puzzle to database',
        details: storageResult.details || 'Unknown error',
      });
      return;
    }
    
    // Success response
    res.status(200).json({
      success: true,
      message: 'Puzzle submitted successfully!',
      normalizedAnswer: validation.normalizedData.answer,
      puzzleId: storageResult.puzzleId,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    
    if (error instanceof SyntaxError) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON format in request body',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error processing submission',
      });
    }
  }
}
