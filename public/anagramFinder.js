function matchesAtPosition(word, template, startPos, firstNonEmpty, lastNonEmpty) {
    for (let i = firstNonEmpty; i <= lastNonEmpty; i++) {
        const wordPos = startPos + (i - firstNonEmpty);
        if (template[i] !== '' && word[wordPos] !== template[i]) {
            return false;
        }
    }
    return true;
}

function getValidPositions(word, template) {
    const hasTemplate = template.some(letter => letter !== '');
    const positions = [];

    if (word.length < 3 || word.length > 5) return positions;

    if (word.length === 5) {
        let matches = true;
        for (let i = 0; i < word.length; i++) {
            if (template[i] !== '' && word[i] !== template[i]) {
                matches = false;
                break;
            }
        }
        if (matches) {
            positions.push(0);
        }
        return positions;
    }

    if (!hasTemplate) {
        for (let startPos = 0; startPos <= 5 - word.length; startPos++) {
            positions.push(startPos);
        }
        return positions;
    }

    const firstNonEmpty = template.findIndex(letter => letter !== '');
    const lastNonEmpty = template.findLastIndex(letter => letter !== '');

    const patternLength = lastNonEmpty - firstNonEmpty + 1;
    const minStartPos = Math.max(0, word.length - (template.length - firstNonEmpty));
    const maxStartPos = Math.min(firstNonEmpty, word.length - patternLength);

    for (let startPos = minStartPos; startPos <= maxStartPos; startPos++) {
        if (matchesAtPosition(word, template, startPos, firstNonEmpty, lastNonEmpty)) {
            positions.push(startPos);
        }
    }

    return positions;
}

function matchesTemplate(word, template) {
    return getValidPositions(word, template).length > 0;
}

function canMakeWordWithTemplate(availableLetters, word, template) {
    const templateLetters = template.filter(letter => letter !== '');
    const available = [...availableLetters, ...templateLetters];
    const needed = [...word];
    const wildcardTypes = [];

    for (let letter of needed) {
        const index = available.indexOf(letter);
        const questionIndex = available.indexOf('?');
        const starIndex = available.indexOf('*');

        if (index !== -1) {
            available.splice(index, 1);
            wildcardTypes.push(null);
        } else if (questionIndex !== -1) {
            available.splice(questionIndex, 1);
            wildcardTypes.push('?');
        } else if (starIndex !== -1) {
            available.splice(starIndex, 1);
            wildcardTypes.push('*');
        } else {
            return { canMake: false };
        }
    }

    return { canMake: true, wildcardTypes };
}

function findAnagrams(wordlist, template, letters) {
    return wordlist
        .map(word => {
            const positions = getValidPositions(word, template);
            if (positions.length === 0) {
                return null;
            }
            const result = canMakeWordWithTemplate(letters, word, template);
            if (!result.canMake) {
                return null;
            }
            return { word, wildcardTypes: result.wildcardTypes, positions };
        })
        .filter(result => result !== null);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findAnagrams };
}