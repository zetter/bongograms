let commonWords = [];
let allWords = [];

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
const multiplierButtons = document.querySelectorAll('.multiplier-btn');
const toggleScoresLink = document.getElementById('toggle-scores');

const multipliers = [1, 1, 1, 1, 1];
let scoresVisible = false;

multiplierButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        multipliers[index] = multipliers[index] === 1 ? 2 : multipliers[index] === 2 ? 3 : 1;
        btn.textContent = `${multipliers[index]}x`;
        btn.classList.toggle('active', multipliers[index] > 1);
        updateResults();
    });
});

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
        ...commonMatches.map(m => {
            const { position, score, baseScore, bonusScore } = findBestPosition(m.word, m.wildcardTypes, m.positions, multipliers, true);
            return {
                word: m.word,
                wildcardTypes: m.wildcardTypes,
                position,
                isCommon: true,
                score,
                baseScore,
                bonusScore
            };
        }),
        ...uniqueAllMatches.map(m => {
            const { position, score, baseScore, bonusScore } = findBestPosition(m.word, m.wildcardTypes, m.positions, multipliers, false);
            return {
                word: m.word,
                wildcardTypes: m.wildcardTypes,
                position,
                isCommon: false,
                score,
                baseScore,
                bonusScore
            };
        })
    ];

    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">No words found</div>';
        toggleScoresLink.style.display = 'none';
    } else {
        const totalMatches = matches.length;
        const displayMatches = matches.slice(0, 200);

        let html = displayMatches.map(({ word, wildcardTypes, isCommon, score, baseScore, bonusScore }) => {
            const scoreDisplay = isCommon
                ? `${baseScore} + <span class="bonus-score">${bonusScore}</span>`
                : `${score}`;
            return `<div class="word${isCommon ? ' common' : ''}${scoresVisible ? ' show-score' : ''}" data-score="${score}">
                <div class="word-text">${formatWord(word, wildcardTypes)}</div>
                <div class="word-score">${scoreDisplay}</div>
            </div>`;
        }).join('');

        if (totalMatches > 200) {
            html += '<div class="no-results">More words found, just showing the top 200</div>';
        }

        wordsContainer.innerHTML = html;
        toggleScoresLink.style.display = 'inline';
    }
}

toggleScoresLink.addEventListener('click', (e) => {
    e.preventDefault();
    scoresVisible = !scoresVisible;
    toggleScoresLink.textContent = scoresVisible ? 'Hide scores' : 'Show estimated scores';

    const words = wordsContainer.querySelectorAll('.word');
    words.forEach(word => {
        word.classList.toggle('show-score', scoresVisible);
    });
});

loadDictionary();