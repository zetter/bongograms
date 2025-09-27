const letterScores = {
    a: 5, b: 50, c: 35, d: 30, e: 5, f: 60, g: 45, h: 40, i: 10, j: 80,
    k: 50, l: 9, m: 35, n: 25, o: 7, p: 35, q: 90, r: 7, s: 5, t: 9,
    u: 15, v: 70, w: 65, x: 80, y: 35, z: 80
};

function calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon) {
    const baseScore = [...word].reduce((sum, letter, index) => {
        if (wildcardTypes[index] === '*') {
            return sum;
        }
        const letterScore = letterScores[letter] || 0;
        const gridPosition = position + index;
        const multiplier = multipliers[gridPosition] || 1;
        return sum + (letterScore * multiplier);
    }, 0);
    const finalScore = isCommon ? baseScore * 1.3 : baseScore;
    const roundedFinal = Math.ceil(finalScore);
    const bonusScore = isCommon ? roundedFinal - baseScore : 0;
    return { score: roundedFinal, baseScore, bonusScore };
}

function findBestPosition(word, wildcardTypes, positions, multipliers, isCommon) {
    let bestScore = 0;
    let bestPosition = positions[0];
    let bestBaseScore = 0;
    let bestBonusScore = 0;

    for (const position of positions) {
        const result = calculateScoreAtPosition(word, wildcardTypes, position, multipliers, isCommon);
        if (result.score > bestScore) {
            bestScore = result.score;
            bestBaseScore = result.baseScore;
            bestBonusScore = result.bonusScore;
            bestPosition = position;
        }
    }

    return { position: bestPosition, score: bestScore, baseScore: bestBaseScore, bonusScore: bestBonusScore };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { letterScores, calculateScoreAtPosition, findBestPosition };
}