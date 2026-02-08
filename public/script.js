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
const lettersChooser = document.getElementById('letters-chooser');
const lettersModeButtons = document.querySelectorAll('.letters-mode .mode-btn');
const wordsContainer = document.getElementById('words-container');
const templateBoxes = document.querySelectorAll('.template-box');
const multiplierButtons = document.querySelectorAll('.multiplier-btn');
const toggleScoresLink = document.getElementById('toggle-scores');

const multipliers = [1, 1, 1, 1, 1];
let scoresVisible = false;
let dictionaryLoaded = false;

let lettersMode = 'any';
let hasEverChosenLetters = false;

function setLettersMode(nextMode) {
    lettersMode = nextMode;

    lettersModeButtons.forEach((btn) => {
        const isActive = btn.dataset.mode === lettersMode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const showChooser = lettersMode === 'choose';
    lettersChooser.classList.toggle('hidden', !showChooser);

    if (showChooser) {
        if (!hasEverChosenLetters) {
            input.value = '';
            hasEverChosenLetters = true;
        }
        input.disabled = !dictionaryLoaded;
        input.focus();
    } else {
        input.disabled = true;
        input.blur();
    }

    updateResults();
}

multiplierButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        multipliers[index] = multipliers[index] === 1
            ? 2
            : multipliers[index] === 2
                ? 3
                : multipliers[index] === 3
                    ? 0
                    : 1;

        btn.textContent = multipliers[index] === 0 ? 'X' : `${multipliers[index]}x`;
        btn.classList.toggle('active', multipliers[index] > 1);
        btn.classList.toggle('off', multipliers[index] === 0);

        const column = btn.closest('.template-column');
        const templateBox = column?.querySelector('.template-box');
        if (templateBox) {
            templateBox.disabled = multipliers[index] === 0;
            column?.classList.toggle('off', multipliers[index] === 0);

            // If you turned off the currently-focused box, move focus.
            if (document.activeElement === templateBox && templateBox.disabled) {
                let nextIndex = index + 1;
                while (nextIndex < templateBoxes.length && templateBoxes[nextIndex].disabled) {
                    nextIndex++;
                }
                if (nextIndex < templateBoxes.length) {
                    templateBoxes[nextIndex].focus();
                } else {
                    let prevIndex = index - 1;
                    while (prevIndex >= 0 && templateBoxes[prevIndex].disabled) {
                        prevIndex--;
                    }
                    if (prevIndex >= 0) {
                        templateBoxes[prevIndex].focus();
                    }
                }
            }
        }

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

        dictionaryLoaded = true;
        wordsContainer.innerHTML = '<div class="no-results">Enter a template above to find words</div>';

        // Default mode is "any" (input hidden/disabled). Only enable the input when explicitly choosing letters.
        if (lettersMode === 'choose') {
            input.disabled = false;
        }
    } catch (error) {
        wordsContainer.innerHTML = '<div class="no-results">Error loading word list</div>';
        console.error('Failed to load dictionary:', error);
    }
}

input.addEventListener('input', updateResults);

lettersModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLettersMode(btn.dataset.mode));
});

templateBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase();
        if (e.target.value && index < templateBoxes.length - 1) {
            let nextIndex = index + 1;
            while (nextIndex < templateBoxes.length && templateBoxes[nextIndex].disabled) {
                nextIndex++;
            }
            if (nextIndex < templateBoxes.length) {
                templateBoxes[nextIndex].focus();
            }
        }
        updateResults();
    });
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            let prevIndex = index - 1;
            while (prevIndex >= 0 && templateBoxes[prevIndex].disabled) {
                prevIndex--;
            }
            if (prevIndex >= 0) {
                templateBoxes[prevIndex].focus();
            }
        }
    });
    box.addEventListener('focus', (e) => {
        e.target.select();
    });
    box.addEventListener('click', (e) => {
        e.target.select();
    });
});

function updateResults() {
    const templateRaw = Array.from(templateBoxes).map(box => box.value.toLowerCase());
    const activeIndices = multipliers
        .map((m, i) => (m === 0 ? null : i))
        .filter(i => i !== null);
    const isLengthFiltered = activeIndices.length !== 5;

    const template = isLengthFiltered
        ? activeIndices.map(i => templateRaw[i])
        : templateRaw;

    const multipliersForScoring = isLengthFiltered
        ? activeIndices.map(i => multipliers[i])
        : multipliers;

    const hasTemplate = template.some(letter => letter !== '');
    const chosenLetters = input.value.toLowerCase().trim();

    // No results when template is blank AND "Any letters" is selected.
    // If "Choose letters" is selected, allow searching with letters only.
    if (!hasTemplate) {
        if (lettersMode === 'any') {
            wordsContainer.innerHTML = '<div class="no-results">Enter a template above to find words</div>';
            return;
        }

        if (chosenLetters.length === 0) {
            wordsContainer.innerHTML = '<div class="no-results">Enter letters above to find words</div>';
            return;
        }
    }

    if (commonWords.length === 0 && allWords.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">Word list not loaded yet</div>';
        return;
    }

    const wildcardCount = isLengthFiltered ? activeIndices.length : 5;
    const letters = (lettersMode === 'any') ? '?'.repeat(wildcardCount) : chosenLetters;

    let commonMatches = findAnagrams(commonWords, template, letters);
    let allMatches = findAnagrams(allWords, template, letters);

    if (isLengthFiltered) {
        const requiredLength = activeIndices.length;
        commonMatches = commonMatches.filter(m => m.word.length === requiredLength);
        allMatches = allMatches.filter(m => m.word.length === requiredLength);
    }

    const commonSet = new Set(commonMatches.map(m => m.word));
    const uniqueAllMatches = allMatches.filter(m => !commonSet.has(m.word));

    const matches = [
        ...commonMatches.map(m => {
            const { position, score, baseScore, bonusScore } = findBestPosition(m.word, m.wildcardTypes, m.positions, multipliersForScoring, true);
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
            const { position, score, baseScore, bonusScore } = findBestPosition(m.word, m.wildcardTypes, m.positions, multipliersForScoring, false);
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

// Initialize UI state
setLettersMode('any');