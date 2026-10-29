#!/usr/bin/env node
/**
 * Integration test script for Emoji Rebus Blitz
 */

import { puzzleManager } from '../lib/kv-puzzle-manager.js';
import seedDatabase from './seed-puzzles.js';

async function runIntegrationTests() {
  console.log('=== Emoji Rebus Blitz Integration Tests ===\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: KV Connection
  console.log('Test 1: KV Connection');
  try {
    await puzzleManager.init();
    const count = await puzzleManager.getPuzzleCount();
    console.log(`  ✅ KV connected, puzzle count: ${count}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ KV connection failed: ${error.message}`);
    failed++;
  }
  
  // Test 2: Seed Database
  console.log('\nTest 2: Database Seeding');
  try {
    const seeded = await seedDatabase();
    console.log(`  ✅ Database seeding completed`);
    passed++;
  } catch (error) {
    console.log(`  ❌ Database seeding failed: ${error.message}`);
    failed++;
  }
  
  // Test 3: Random Puzzle Fetch
  console.log('\nTest 3: Random Puzzle Fetch');
  try {
    const puzzle = await puzzleManager.fetchRandomPuzzle();
    if (puzzle.emoji && puzzle.answer && puzzle.hint) {
      console.log(`  ✅ Fetched puzzle: "${puzzle.emoji}" -> ${puzzle.answer}`);
      passed++;
    } else {
      console.log(`  ❌ Invalid puzzle structure`);
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ Puzzle fetch failed: ${error.message}`);
    failed++;
  }
  
  // Test 4: Validation Module
  console.log('\nTest 4: Validation Module');
  try {
    const { validateSubmission, normalizeAnswer } = await import('../lib/validation.js');
    
    // Test normalization
    const normalized = normalizeAnswer('Spider-Man!');
    if (normalized === 'spiderman') {
      console.log(`  ✅ Normalization: "Spider-Man!" -> "${normalized}"`);
    } else {
      console.log(`  ❌ Normalization failed: got "${normalized}", expected "spiderman"`);
      failed++;
    }
    
    // Test validation
    const validData = {
      emoji: '🌊🏄‍♂️',
      answer: 'surfing',
      hint: 'Something surfers do',
    };
    
    const invalidData = {
      emoji: 'no emoji',
      answer: '',
      hint: 'test',
    };
    
    const validResult = validateSubmission(validData);
    const invalidResult = validateSubmission(invalidData);
    
    if (validResult.isValid && !invalidResult.isValid) {
      console.log(`  ✅ Validation works: accepts valid, rejects invalid`);
      passed++;
    } else {
      console.log(`  ❌ Validation failed`);
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Validation test failed: ${error.message}`);
    failed++;
  }
  
  // Test 5: API Endpoints (simulated)
  console.log('\nTest 5: API Endpoint Simulation');
  try {
    // Simulate puzzle endpoint
    const puzzle = await puzzleManager.fetchRandomPuzzle();
    const puzzleResponse = {
      emoji: puzzle.emoji,
      hint: puzzle.hint,
      id: puzzle.id,
    };
    
    if (puzzleResponse.emoji && puzzleResponse.hint) {
      console.log(`  ✅ Puzzle endpoint simulation: returns emoji + hint`);
      passed++;
    } else {
      console.log(`  ❌ Puzzle endpoint simulation failed`);
      failed++;
    }
    
    // Simulate health endpoint
    const { checkKVHealth } = await import('../lib/kv-client.js');
    const health = await checkKVHealth();
    
    if (health.status) {
      console.log(`  ✅ Health endpoint simulation: status = ${health.status}`);
      passed++;
    } else {
      console.log(`  ❌ Health endpoint simulation failed`);
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ API simulation failed: ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total tests: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All integration tests passed!');
    console.log('\nNext steps:');
    console.log('1. Set up Vercel KV credentials in .env.local');
    console.log('2. Run: node scripts/seed-puzzles.js');
    console.log('3. Start dev server: vercel dev (or npx serve public for frontend only)');
    console.log('4. Open http://localhost:3000 to play!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run tests
runIntegrationTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
