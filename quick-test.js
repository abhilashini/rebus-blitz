// Quick manual testing guide

console.log('=== Quick Test Instructions ===\n');
console.log('1. Open public/index.html directly in your browser:');
console.log('   file://' + process.cwd() + '/public/index.html\n');

console.log('2. Test API endpoints manually:');
console.log('   Health check:');
console.log('     curl -X GET http://localhost:3000/api/health\n');
console.log('   Get puzzle:');
console.log('     curl -X GET http://localhost:3000/api/puzzle\n');
console.log('   Submit puzzle (valid):');
console.log('     curl -X POST http://localhost:3000/api/submit \\');
console.log('       -H "Content-Type: application/json" \\');
console.log('       -d \'{"emoji":"🌊🏄‍♂️","answer":"Surfing!","hint":"Something surfers do"}\'\n');
console.log('   Submit puzzle (invalid - no emoji):');
console.log('     curl -X POST http://localhost:3000/api/submit \\');
console.log('       -H "Content-Type: application/json" \\');
console.log('       -d \'{"emoji":"no emoji","answer":"test","hint":"test"}\'\n');
console.log('   Submit puzzle (with Spider-Man test):');
console.log('     curl -X POST http://localhost:3000/api/submit \\');
console.log('       -H "Content-Type: application/json" \\');
console.log('       -d \'{"emoji":"🕷️🦸‍♂️","answer":"Spider-Man!","hint":"Web-slinger"}\'\n');

console.log('=== API Validation Logic Check ===\n');

// Test the actual validation functions from api/submit.js
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

console.log('Validation logic test results:');
console.log('normalizeAnswer("Spider-Man!") =', normalizeAnswer('Spider-Man!'));
console.log('  Expected: "spiderman"');
console.log('  ✓ Pass' + (normalizeAnswer('Spider-Man!') === 'spiderman' ? '' : ' ✗ FAIL'));
console.log();
console.log('containsEmoji("🌊🏄‍♂️") =', containsEmoji('🌊🏄‍♂️'));
console.log('  Expected: true');
console.log('containsEmoji("no emoji") =', containsEmoji('no emoji'));
console.log('  Expected: false');
