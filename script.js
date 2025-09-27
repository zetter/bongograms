let dictionary = [];

const input = document.getElementById('letters');
const wordsContainer = document.getElementById('words-container');

async function loadDictionary() {
    wordsContainer.innerHTML = '<div class="no-results">Loading word list...</div>';

    try {
        const response = await fetch('https://raw.githubusercontent.com/puzzmo-com/words/refs/heads/main/bongo/commonWords.txt');
        const text = await response.text();
        dictionary = text.split('\n')
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

function findAnagrams() {
    const letters = input.value.toLowerCase().trim();

    if (letters.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">Enter letters above to find words</div>';
        return;
    }

    if (dictionary.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">Word list not loaded yet</div>';
        return;
    }

    const matches = dictionary.filter(word => {
        return canMakeWord(letters, word);
    });

    if (matches.length === 0) {
        wordsContainer.innerHTML = '<div class="no-results">No words found</div>';
    } else {
        wordsContainer.innerHTML = matches.map(word =>
            `<div class="word">${word}</div>`
        ).join('');
    }
}

loadDictionary();

function canMakeWord(availableLetters, word) {
    const available = availableLetters.split('');
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