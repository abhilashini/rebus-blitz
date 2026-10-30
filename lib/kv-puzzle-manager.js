/**
 * KV Puzzle Manager
 * Manages puzzle storage and retrieval from Vercel KV with random selection
 */

import { getKVClient } from './kv-client.js';

/**
 * Puzzle data structure
 * @typedef {Object} Puzzle
 * @property {string} id - Unique identifier (UUID)
 * @property {string} emoji - Emoji rebus string
 * @property {string} answer - Correct answer (normalized)
 * @property {string} hint - Helpful hint text
 * @property {string} createdAt - ISO timestamp
 * @property {number} usageCount - Number of times shown
 */

/**
 * KV Puzzle Manager class
 */
export class KVPuzzleManager {
  /**
   * Initialize puzzle manager
   */
  constructor() {
    this.kvClient = null;
    this.initialized = false;
  }

  /**
   * Initialize connection to KV
   * @returns {Promise<KVPuzzleManager>} Initialized manager
   */
  async init() {
    if (this.initialized) {
      return this;
    }
    
    this.kvClient = await getKVClient();
    this.initialized = true;
    return this;
  }

  /**
   * Fetch a random puzzle from KV storage
   * @returns {Promise<Puzzle>} Random puzzle object
   * @throws {Error} If no puzzles available
   */
  async fetchRandomPuzzle() {
    await this.init();
    
    try {
      // Get all puzzle IDs
      const puzzleIds = await this.kvClient.lrange('puzzles:ids', 0, -1);
      
      if (puzzleIds.length === 0) {
        throw new Error('No puzzles available in the database');
      }
      
      // Select random ID with uniform distribution
      const randomIndex = Math.floor(Math.random() * puzzleIds.length);
      const puzzleId = puzzleIds[randomIndex];
      
      // Fetch puzzle data
      const puzzleData = await this.kvClient.hgetall(`puzzle:${puzzleId}`);
      
      if (!puzzleData.id) {
        // Data might be malformed, try to repair
        puzzleData.id = puzzleId;
      }
      
      // Increment usage count atomically
      const currentCount = parseInt(puzzleData.usageCount) || 0;
      await this.kvClient.hincrby(`puzzle:${puzzleId}`, 'usageCount', 1);
      
      let aliases = [];
      try {
        aliases = puzzleData.aliases ? (typeof puzzleData.aliases === 'string' ? JSON.parse(puzzleData.aliases) : puzzleData.aliases) : [];
      } catch {
        aliases = [];
      }
      
      // Return puzzle object
      return {
        id: puzzleData.id || puzzleId,
        emoji: puzzleData.emoji || '',
        answer: puzzleData.answer || '',
        aliases: Array.isArray(aliases) ? aliases : [],
        hint: puzzleData.hint || '',
        createdAt: puzzleData.createdAt || new Date().toISOString(),
        usageCount: currentCount + 1,
      };
      
    } catch (error) {
      console.error('Error fetching random puzzle:', error);
      
      // Provide fallback puzzle if KV fails
      if (error.message.includes('No puzzles available')) {
        throw error; // Re-throw so caller can handle specifically
      }
      
      // For other errors, provide a default puzzle
      return this.getFallbackPuzzle();
    }
  }

  /**
   * Fetch all or latest community puzzles
   * @param {number} limit - Maximum puzzles to return
   * @returns {Promise<Array<Puzzle>>} Array of puzzles
   */
  async fetchAllPuzzles(limit = 60) {
    await this.init();
    try {
      const puzzleIds = await this.kvClient.lrange('puzzles:ids', 0, limit - 1);
      if (!puzzleIds || puzzleIds.length === 0) return [];
      
      const results = [];
      for (const id of puzzleIds) {
        try {
          const data = await this.kvClient.hgetall(`puzzle:${id}`);
          if (data && data.emoji && data.answer) {
            let aliases = [];
            try {
              aliases = data.aliases ? (typeof data.aliases === 'string' ? JSON.parse(data.aliases) : data.aliases) : [];
            } catch {
              aliases = [];
            }
            results.push({
              id: data.id || id,
              emoji: data.emoji,
              answer: data.answer,
              aliases: Array.isArray(aliases) ? aliases : [],
              hint: data.hint || '',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }
        } catch {
          // ignore single item read error
        }
      }
      return results;
    } catch (err) {
      console.warn('Could not fetch community puzzles:', err.message);
      return [];
    }
  }

  /**
   * Store a new puzzle in KV storage
   * @param {Object} puzzleData - Puzzle data
   * @param {string} puzzleData.emoji - Emoji string
   * @param {string} puzzleData.answer - Normalized answer
   * @param {Array<string>} [puzzleData.aliases] - Alternate acceptable answers
   * @param {string} puzzleData.hint - Hint text
   * @returns {Promise<Object>} Stored puzzle with ID
   */
  async storePuzzle(puzzleData) {
    await this.init();
    
    try {
      // Generate unique ID
      const puzzleId = this.generateUUID();
      const timestamp = new Date().toISOString();
      const aliases = Array.isArray(puzzleData.aliases) ? puzzleData.aliases : [];
      
      const puzzle = {
        id: puzzleId,
        emoji: puzzleData.emoji,
        answer: puzzleData.answer,
        aliases: JSON.stringify(aliases),
        hint: puzzleData.hint,
        createdAt: timestamp,
        usageCount: 0,
      };
      
      // Store puzzle hash
      await this.kvClient.hset(`puzzle:${puzzleId}`, puzzle);
      
      // Add to puzzle IDs list
      await this.kvClient.lpush('puzzles:ids', puzzleId);
      
      console.log(`Stored new puzzle: ${puzzleId}`);
      return {
        success: true,
        puzzleId,
        puzzle: {
          ...puzzle,
          aliases,
        },
      };
      
    } catch (error) {
      console.error('Error storing puzzle:', error);
      return {
        success: false,
        error: 'Failed to store puzzle in database',
        details: error.message,
      };
    }
  }

  /**
   * Get total count of puzzles in KV
   * @returns {Promise<number>} Puzzle count
   */
  async getPuzzleCount() {
    await this.init();
    
    try {
      const puzzleIds = await this.kvClient.lrange('puzzles:ids', 0, -1);
      return puzzleIds.length;
    } catch (error) {
      console.error('Error getting puzzle count:', error);
      return 0;
    }
  }

  /**
   * Seed initial puzzle dataset
   * @param {Array<Object>} puzzles - Array of puzzle objects
   * @returns {Promise<number>} Number of puzzles seeded
   */
  async seedInitialPuzzles(puzzles) {
    await this.init();
    
    try {
      const existingCount = await this.getPuzzleCount();
      
      // Only seed if database is empty
      if (existingCount > 0) {
        console.log(`Database already has ${existingCount} puzzles, skipping seed`);
        return existingCount;
      }
      
      console.log(`Seeding ${puzzles.length} initial puzzles...`);
      
      let seededCount = 0;
      for (const puzzleData of puzzles) {
        const result = await this.storePuzzle(puzzleData);
        if (result.success) {
          seededCount++;
        }
      }
      
      console.log(`Successfully seeded ${seededCount} puzzles`);
      return seededCount;
      
    } catch (error) {
      console.error('Error seeding puzzles:', error);
      return 0;
    }
  }

  /**
   * Get fallback puzzle for when KV is unavailable
   * @returns {Puzzle} Fallback puzzle
   */
  getFallbackPuzzle() {
    const fallbackPuzzles = [
      {
        id: 'fallback-1',
        emoji: '🌊🏄‍♂️',
        answer: 'surfing',
        hint: 'Something surfers do',
        createdAt: new Date().toISOString(),
        usageCount: 1,
      },
      {
        id: 'fallback-2',
        emoji: '🐝📄',
        answer: 'beeline',
        hint: 'Direct route like a bee to honey',
        createdAt: new Date().toISOString(),
        usageCount: 1,
      },
      {
        id: 'fallback-3',
        emoji: '👁️💭',
        answer: 'idea',
        hint: 'A thought or concept',
        createdAt: new Date().toISOString(),
        usageCount: 1,
      },
    ];
    
    // Return random fallback puzzle
    const randomIndex = Math.floor(Math.random() * fallbackPuzzles.length);
    return fallbackPuzzles[randomIndex];
  }

  /**
   * Generate UUID v4
   * @returns {string} UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export singleton instance
export const puzzleManager = new KVPuzzleManager();
