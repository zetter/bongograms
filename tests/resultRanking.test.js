const { test } = require('node:test');
const assert = require('node:assert');

const { compareMatches, findBestPositionForOrdering } = require('../public/resultRanking.js');

test('compareMatches keeps common/bonus words first', () => {
  const a = { word: 'aaa', isCommon: true, score: 1, multiplierSpaceScore: 0 };
  const b = { word: 'bbb', isCommon: false, score: 999, multiplierSpaceScore: 999 };

  assert.ok(compareMatches(a, b, true) < 0);
  assert.ok(compareMatches(b, a, true) > 0);
});

test('compareMatches prefers multiplierSpaceScore when multipliers exist', () => {
  const a = { word: 'aaa', isCommon: true, score: 1000, multiplierSpaceScore: 10 };
  const b = { word: 'bbb', isCommon: true, score: 5, multiplierSpaceScore: 999 };

  assert.ok(compareMatches(a, b, true) > 0);
  assert.ok(compareMatches(b, a, true) < 0);
});

test('compareMatches falls back to score when no multipliers', () => {
  const a = { word: 'aaa', isCommon: true, score: 10, multiplierSpaceScore: 999 };
  const b = { word: 'bbb', isCommon: true, score: 11, multiplierSpaceScore: 0 };

  assert.ok(compareMatches(a, b, false) > 0);
  assert.ok(compareMatches(b, a, false) < 0);
});

test('findBestPositionForOrdering chooses placement maximizing 2x/3x usage', () => {
  // For the word "quiz", putting q on the 3x (position 0) should win.
  const word = 'quiz';
  const wildcardTypes = [null, null, null, null];
  const positions = [0, 1];
  const multipliers = [3, 1, 1, 1, 1];

  const result = findBestPositionForOrdering(word, wildcardTypes, positions, multipliers, false);

  assert.strictEqual(result.position, 0);
});
