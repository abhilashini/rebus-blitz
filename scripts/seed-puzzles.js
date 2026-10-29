#!/usr/bin/env node
/**
 * Seed script for initial puzzle dataset
 */

import { puzzleManager } from '../lib/kv-puzzle-manager.js';

const initialPuzzles = [
  {
    emoji: '🌊🏄‍♂️',
    answer: 'surfing',
    hint: 'Something surfers do',
  },
  {
    emoji: '🐝📄',
    answer: 'beeline',
    hint: 'Direct route like a bee to honey',
  },
  {
    emoji: '👁️💭',
    answer: 'idea',
    hint: 'A thought or concept',
  },
  {
    emoji: '🕷️🦸‍♂️',
    answer: 'spiderman',
    hint: 'Web-slinging superhero',
  },
  {
    emoji: '🧠💥',
    answer: 'brainstorm',
    hint: 'Creative thinking session',
  },
  {
    emoji: '⌚🐕',
    answer: 'watchdog',
    hint: 'Security monitor or protective dog',
  },
  {
    emoji: '🌧️🐱🐶',
    answer: 'raining cats and dogs',
    hint: 'Heavy rainfall',
  },
  {
    emoji: '🐝🍯',
    answer: 'honey',
    hint: 'Sweet substance made by bees',
  },
  {
    emoji: '🔥📦',
    answer: 'hotbox',
    hint: 'Container that gets very warm',
  },
  {
    emoji: '👻👻',
    answer: 'double trouble',
    hint: 'Twice the problems',
  },
  {
    emoji: '🐦🎤',
    answer: 'tweet',
    hint: 'Short message on social media',
  },
  {
    emoji: '🍎📱',
    answer: 'iphone',
    hint: 'Popular smartphone brand',
  },
  {
    emoji: '👑❤️',
    answer: 'heart of gold',
    hint: 'Someone very kind and generous',
  },
  {
    emoji: '🧊🔥',
    answer: 'ice fire',
    hint: 'Contradictory elements',
  },
  {
    emoji: '🐱🎻',
    answer: 'cat got your tongue',
    hint: 'Speechless or unable to speak',
  },
];

async function seedDatabase() {
  console.log('Starting puzzle database seeding...');
  
  try {
    // Initialize puzzle manager
    await puzzleManager.init();
    
    // Seed puzzles
    const seededCount = await puzzleManager.seedInitialPuzzles(initialPuzzles);
    
    if (seededCount > 0) {
      console.log(`✅ Successfully seeded ${seededCount} puzzles`);
      
      // Verify by fetching count
      const finalCount = await puzzleManager.getPuzzleCount();
      console.log(`📊 Total puzzles in database: ${finalCount}`);
      
      // Test random fetch
      const testPuzzle = await puzzleManager.fetchRandomPuzzle();
      console.log(`🧪 Test fetch: "${testPuzzle.emoji}" -> ${testPuzzle.answer}`);
      
    } else {
      console.log('⚠️  No puzzles seeded (database may already have puzzles)');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
