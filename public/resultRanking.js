let cachedScoring = null;

function getScoring() {
  if (cachedScoring) {
    return cachedScoring;
  }

  // Node: use scoring.js via require
  if (typeof module !== 'undefined' && module.exports) {
    // eslint-disable-next-line global-require
    const scoring = require('./scoring.js');
    cachedScoring = {
      calculateScoreAtPosition: scoring.calculateScoreAtPosition,
      letterScores: scoring.letterScores
    };
    return cachedScoring;
  }

  // Browser: scoring.js is loaded before this file and defines globals
  cachedScoring = {
    // Note: `letterScores` is a global binding, not a `window` property.
    calculateScoreAtPosition,
    letterScores
  };
  return cachedScoring;
}

function calculateMultiplierSpaceScore(word, wildcardTypes, position, multipliers, letterScores) {
  return [...word].reduce((sum, letter, index) => {
    if (wildcardTypes[index] === '*') {
      return sum;
    }
    const gridPosition = position + index;
    const multiplier = multipliers[gridPosition] || 1;
    if (multiplier <= 1) {
      return sum;
    }
    const letterScore = letterScores[letter] || 0;
    return sum + (letterScore * multiplier);
  }, 0);
}

function findBestPositionForOrdering(word, wildcardTypes, positions, multipliers, isCommon) {
  const { calculateScoreAtPosition, letterScores } = getScoring();
  const hasBoostMultipliers = multipliers.some(m => m > 1);

  let bestPosition = positions[0];
  let bestScore = -Infinity;
  let bestBaseScore = 0;
  let bestBonusScore = 0;
  let bestMultiplierSpaceScore = -Infinity;

  for (const position of positions) {
    const { score, baseScore, bonusScore } = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);
    const multiplierSpaceScore = hasBoostMultipliers
      ? calculateMultiplierSpaceScore(word, wildcardTypes, position, multipliers, letterScores)
      : 0;

    const isBetter = hasBoostMultipliers
      ? (multiplierSpaceScore > bestMultiplierSpaceScore) || (multiplierSpaceScore === bestMultiplierSpaceScore && score > bestScore)
      : (score > bestScore);

    if (isBetter) {
      bestPosition = position;
      bestScore = score;
      bestBaseScore = baseScore;
      bestBonusScore = bonusScore;
      bestMultiplierSpaceScore = multiplierSpaceScore;
    }
  }

  return {
    position: bestPosition,
    score: bestScore,
    baseScore: bestBaseScore,
    bonusScore: bestBonusScore,
    multiplierSpaceScore: hasBoostMultipliers ? bestMultiplierSpaceScore : 0,
    hasBoostMultipliers
  };
}

function compareMatches(a, b, hasBoostMultipliers) {
  // Bonus/common words always first
  if (a.isCommon !== b.isCommon) {
    return a.isCommon ? -1 : 1;
  }

  // Prefer maximizing value in 2x/3x squares when present
  if (hasBoostMultipliers) {
    const diff = (b.multiplierSpaceScore || 0) - (a.multiplierSpaceScore || 0);
    if (diff !== 0) {
      return diff;
    }
  }

  // Tie-breaker (or primary when no 2x/3x): overall score
  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return String(a.word).localeCompare(String(b.word));
}

const resultRanking = {
  calculateMultiplierSpaceScore,
  findBestPositionForOrdering,
  compareMatches
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = resultRanking;
}
