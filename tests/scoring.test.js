const { test } = require('node:test');
const assert = require('node:assert');
const { letterScores, calculateScoreAtPosition, findBestPosition } = require('../public/scoring.js');

test('letterScores contains all letters', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (const letter of letters) {
        assert.ok(letterScores[letter] !== undefined, `Letter ${letter} should have a score`);
        assert.ok(letterScores[letter] > 0, `Letter ${letter} should have a positive score`);
    }
});

test('calculateScoreAtPosition with no multipliers, non-common word', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const position = 0;
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const expectedScore = letterScores.c + letterScores.a + letterScores.t;
    assert.strictEqual(result.score, expectedScore);
    assert.strictEqual(result.baseScore, expectedScore);
    assert.strictEqual(result.bonusScore, 0);
});

test('calculateScoreAtPosition with multipliers', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const position = 0;
    const multipliers = [2, 1, 3, 1, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const expectedScore = (letterScores.c * 2) + (letterScores.a * 1) + (letterScores.t * 3);
    assert.strictEqual(result.score, expectedScore);
    assert.strictEqual(result.baseScore, expectedScore);
    assert.strictEqual(result.bonusScore, 0);
});

test('calculateScoreAtPosition with common word bonus', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const position = 0;
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = true;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const baseScore = letterScores.c + letterScores.a + letterScores.t;
    const expectedFinalScore = Math.ceil(baseScore * 1.3);
    const expectedBonus = expectedFinalScore - baseScore;

    assert.strictEqual(result.score, expectedFinalScore);
    assert.strictEqual(result.baseScore, baseScore);
    assert.strictEqual(result.bonusScore, expectedBonus);
});

test('calculateScoreAtPosition with * wildcard scores as 0', () => {
    const word = 'cat';
    const wildcardTypes = [null, '*', null];
    const position = 0;
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const expectedScore = letterScores.c + 0 + letterScores.t;
    assert.strictEqual(result.score, expectedScore);
    assert.strictEqual(result.baseScore, expectedScore);
});

test('calculateScoreAtPosition with ? wildcard scores normally', () => {
    const word = 'cat';
    const wildcardTypes = [null, '?', null];
    const position = 0;
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const expectedScore = letterScores.c + letterScores.a + letterScores.t;
    assert.strictEqual(result.score, expectedScore);
});

test('calculateScoreAtPosition with position offset', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const position = 2;
    const multipliers = [1, 1, 2, 3, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const expectedScore = (letterScores.c * 2) + (letterScores.a * 3) + (letterScores.t * 1);
    assert.strictEqual(result.score, expectedScore);
});

test('findBestPosition returns highest scoring position', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const positions = [0, 1, 2];
    const multipliers = [1, 1, 3, 2, 1];
    const isCommon = false;

    const result = findBestPosition(word, wildcardTypes, positions, multipliers, isCommon);

    assert.strictEqual(result.position, 2);
    const expectedScore = (letterScores.c * 3) + (letterScores.a * 2) + (letterScores.t * 1);
    assert.strictEqual(result.score, expectedScore);
});

test('findBestPosition with single position', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const positions = [0];
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = false;

    const result = findBestPosition(word, wildcardTypes, positions, multipliers, isCommon);

    assert.strictEqual(result.position, 0);
    const expectedScore = letterScores.c + letterScores.a + letterScores.t;
    assert.strictEqual(result.score, expectedScore);
});

test('findBestPosition with common word', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const positions = [0, 1];
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = true;

    const result = findBestPosition(word, wildcardTypes, positions, multipliers, isCommon);

    const baseScore = letterScores.c + letterScores.a + letterScores.t;
    const expectedScore = Math.ceil(baseScore * 1.3);
    assert.strictEqual(result.score, expectedScore);
    assert.strictEqual(result.baseScore, baseScore);
    assert.ok(result.bonusScore > 0);
});

test('findBestPosition prefers position with higher multipliers', () => {
    const word = 'cat';
    const wildcardTypes = [null, null, null];
    const positions = [0, 1, 2];
    const multipliers = [1, 1, 1, 1, 3];
    const isCommon = false;

    const result = findBestPosition(word, wildcardTypes, positions, multipliers, isCommon);

    assert.strictEqual(result.position, 2);
});

test('calculateScoreAtPosition handles all wildcards', () => {
    const word = 'cat';
    const wildcardTypes = ['*', '*', '*'];
    const position = 0;
    const multipliers = [2, 2, 2, 1, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.baseScore, 0);
});

test('calculateScoreAtPosition with mixed wildcards', () => {
    const word = 'cat';
    const wildcardTypes = ['*', '?', null];
    const position = 0;
    const multipliers = [1, 1, 1, 1, 1];
    const isCommon = false;

    const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);

    const expectedScore = 0 + letterScores.a + letterScores.t;
    assert.strictEqual(result.score, expectedScore);
});