let commonWords = [];
let allWords = [];

const letterScores = {
    a: 5, b: 50, c: 35, d: 30, e: 5, f: 60, g: 45, h: 40, i: 10, j: 80,
    k: 50, l: 9, m: 35, n: 25, o: 7, p: 35, q: 90, r: 7, s: 5, t: 9,
    u: 15, v: 70, w: 65, x: 80, y: 35, z: 80
};

function calculateScore(word, wildcardTypes, isCommon) {
    const baseScore = [...word].reduce((sum, letter, index) => {
        if (wildcardTypes[index] === '*') {
            return sum;
        }
        return sum + (letterScores[letter] || 0);
    }, 0);
    const finalScore = isCommon ? baseScore * 1.3 : baseScore;
    return Math.round(finalScore);
}

function formatWord(word, wildcardTypes) {
    return [...word].map((letter, index) => {
        const wildcardType = wildcardTypes[index];
        if (wildcardType === '?') {
            return `<span class="wildcard-question">${letter}</span>`;
        } else if (wildcardType === '*') {
            return `<span class="wildcard-star">${letter}</span>`;
        }
        return letter;
    }).join('');
}

const input = document.getElementById('letters');
const wordsContainer = document.getElementById('words-container');
const templateBoxes = document.querySelectorAll('.template-box');

async function loadDictionary() {
    wordsContainer.innerHTML = '<div class="no-results">Loading word list...</div>';

    try {
        const [commonResponse, allResponse] = await Promise.all([
            fetch('https://raw.githubusercontent.com/puzzmo-com/words/refs/heads/main/bongo/commonWords.txt'),
            fetch('https://raw.githubusercontent.com/puzzmo-com/words/refs/heads/main/bongo/words.txt')
        ]);

        const commonText = await commonResponse.text();
        const allText = await allResponse.text();

        commonWords = commonText.split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length >= 3 && word.length <= 5);

        allWords = allText.split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length >= 3 && word.length <= 5);

        wordsContainer.innerHTML = '<div class="no-results">Enter letters above to find words</div>';
        input.disabled = false;
    } catch (error) {
        wordsContainer.innerHTML = '<div class="no-results">Error loading word list</div>';
        console.error('Failed to load dictionary:', error);
    }
}

input.addEventListener('input', updateResults);

templateBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase();
        if (e.target.value && index < templateBoxes.length - 1) {
            templateBoxes[index + 1].focus();
        }
        updateResults();
    });
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            templateBoxes[index - 1].focus();
        }
    });
});

function updateResults() {
    const letters = input.value.toLowerCase().trim();
    const template = Array.from(templateBoxes).map(box => box.value.toLowerCase());
    const hasTemplate = template.some(letter => letter !== '');

    if (letters.length === 0 && !hasTemplate) {
        wordsContainer.innerHTML = '<div class="no-results">Enter letters above to find words</div>';
        return;
    }

    if (commonWords.length === 0 && allWords.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">Word list not loaded yet</div>';
        return;
    }

    const commonMatches = findAnagrams(commonWords, template, letters);
    const allMatches = findAnagrams(allWords, template, letters);

    const commonSet = new Set(commonMatches.map(m => m.word));
    const uniqueAllMatches = allMatches.filter(m => !commonSet.has(m.word));

    const matches = [
        ...commonMatches.map(m => ({
            word: m.word,
            wildcardTypes: m.wildcardTypes,
            isCommon: true,
            score: calculateScore(m.word, m.wildcardTypes, true)
        })),
        ...uniqueAllMatches.map(m => ({
            word: m.word,
            wildcardTypes: m.wildcardTypes,
            isCommon: false,
            score: calculateScore(m.word, m.wildcardTypes, false)
        }))
    ];

    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">No words found</div>';
    } else {
        wordsContainer.innerHTML = matches.map(({ word, wildcardTypes, isCommon, score }) =>
            `<div class="word${isCommon ? ' common' : ''}" data-score="${score}">
                <div class="word-text">${formatWord(word, wildcardTypes)}</div>
                <div class="word-score">Score: ${score}</div>
            </div>`
        ).join('');
    }
}

wordsContainer.addEventListener('click', (e) => {
    const wordElement = e.target.closest('.word');
    if (wordElement) {
        wordElement.classList.toggle('show-score');
    }
});

loadDictionary();