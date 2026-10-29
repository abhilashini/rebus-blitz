console.log('=== Emoji Rebus Blitz - Validation Test ===\n');

// Test 1: Check file structure
const fs = require('fs');
const requiredFiles = [
    'package.json',
    'vercel.json', 
    '.env.local',
    'public/index.html',
    'public/style.css',
    'public/app.js',
    'api/health.js',
    'api/puzzle.js',
    'api/submit.js'
];

console.log('1. File Structure Check:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});

// Test 2: Validation logic
console.log('\n2. Validation Logic Check:');

function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function containsEmoji(text) {
    const emojiRegex = /[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu;
    return emojiRegex.test(text);
}

const tests = [
    { input: 'Spider-Man!', expected: 'spiderman', desc: 'Special character removal' },
    { input: 'HELLO World 123', expected: 'hello world 123', desc: 'Case normalization' },
    { input: 'Test@#$%^&*()', expected: 'test', desc: 'Symbol removal' },
    { input: '  Extra Spaces  ', expected: 'extra spaces', desc: 'Trim spaces' }
];

tests.forEach(test => {
    const result = normalizeAnswer(test.input);
    const passed = result === test.expected;
    console.log(`   ${passed ? '✓' : '✗'} ${test.desc}: "${test.input}" → "${result}"`);
});

// Test 3: Emoji detection
console.log('\n3. Emoji Detection Check:');
const emojiTests = [
    { input: '🌊🏄‍♂️', expected: true, desc: 'Contains emoji' },
    { input: 'no emoji here', expected: false, desc: 'No emoji' },
    { input: 'Mixed 🌟 text', expected: true, desc: 'Mixed with emoji' }
];

emojiTests.forEach(test => {
    const result = containsEmoji(test.input);
    const passed = result === test.expected;
    console.log(`   ${passed ? '✓' : '✗'} ${test.desc}: "${test.input.substring(0, 20)}..." → ${result}`);
});

// Test 4: Package.json validation
console.log('\n4. Package.json Check:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const checks = [
        { check: pkg.type === 'module', desc: 'ES Module enabled' },
        { check: pkg.dependencies && pkg.dependencies['@vercel/kv'], desc: '@vercel/kv dependency' },
        { check: pkg.scripts && pkg.scripts.dev === 'vercel dev', desc: 'dev script' }
    ];
    
    checks.forEach(c => {
        console.log(`   ${c.check ? '✓' : '✗'} ${c.desc}`);
    });
} catch (e) {
    console.log('   ✗ Cannot read package.json');
}

console.log('\n=== Test Complete ===');
console.log('To run the frontend:');
console.log('  Option A: Open directly: file://' + process.cwd() + '/public/index.html');
console.log('  Option B: Install Vercel CLI: npm install -g vercel && vercel dev');
console.log('  Option C: Use simple server: npx serve public');
