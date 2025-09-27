let commonWords = [];
let allWords = [];

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

input.addEventListener('input', findAnagrams);

templateBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase();
        if (e.target.value && index < templateBoxes.length - 1) {
            templateBoxes[index + 1].focus();
        }
        findAnagrams();
    });
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            templateBoxes[index - 1].focus();
        }
    });
});

function findAnagrams() {
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

    const commonMatches = commonWords.filter(word => matchesTemplate(word, template) && canMakeWordWithTemplate(letters, word, template));
    const allMatches = allWords.filter(word => matchesTemplate(word, template) && canMakeWordWithTemplate(letters, word, template));

    const commonSet = new Set(commonMatches);
    const uniqueAllMatches = allMatches.filter(word => !commonSet.has(word));

    const matches = [
        ...commonMatches.map(word => ({ word, isCommon: true })),
        ...uniqueAllMatches.map(word => ({ word, isCommon: false }))
    ];

    if (matches.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">No words found</div>';
    } else {
        wordsContainer.innerHTML = matches.map(({ word, isCommon }) =>
            `<div class="word${isCommon ? ' common' : ''}">${word}</div>`
        ).join('');
    }
}

loadDictionary();

function matchesTemplate(word, template) {
    const hasTemplate = template.some(letter => letter !== '');
    if (!hasTemplate) return true;
    if (word.length < 3 || word.length > 5) return false;

    if (word.length < 5) {
        return true;
    }

    for (let i = 0; i < word.length; i++) {
        if (template[i] !== '' && word[i] !== template[i]) {
            return false;
        }
    }

    return true;
}

function canMakeWordWithTemplate(availableLetters, word, template) {
    const templateLetters = template.filter(letter => letter !== '');
    const available = availableLetters.split('').concat(templateLetters);
    const needed = word.split('');

    for (let letter of needed) {
        const index = available.indexOf(letter);
        const wildcardIndex = available.indexOf('?');

        if (index !== -1) {
            available.splice(index, 1);
        } else if (wildcardIndex !== -1) {
            available.splice(wildcardIndex, 1);
        } else {
            return false;
        }
    }

    return true;
}