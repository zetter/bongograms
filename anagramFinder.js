function matchesAtPosition(word, template, startPos, firstNonEmpty, lastNonEmpty) {
    for (let i = firstNonEmpty; i <= lastNonEmpty; i++) {
        const wordPos = startPos + (i - firstNonEmpty);
        if (template[i] !== '' && word[wordPos] !== template[i]) {
            return false;
        }
    }
    return true;
}

function matchesTemplate(word, template) {
    const hasTemplate = template.some(letter => letter !== '');
    if (!hasTemplate) return true;
    if (word.length < 3 || word.length > 5) return false;

    if (word.length === 5) {
        for (let i = 0; i < word.length; i++) {
            if (template[i] !== '' && word[i] !== template[i]) {
                return false;
            }
        }
        return true;
    }

    const firstNonEmpty = template.findIndex(letter => letter !== '');
    const lastNonEmpty = template.findLastIndex(letter => letter !== '');

    const patternLength = lastNonEmpty - firstNonEmpty + 1;
    const minStartPos = Math.max(0, word.length - (template.length - firstNonEmpty));
    const maxStartPos = Math.min(firstNonEmpty, word.length - patternLength);

    for (let startPos = minStartPos; startPos <= maxStartPos; startPos++) {
        if (matchesAtPosition(word, template, startPos, firstNonEmpty, lastNonEmpty)) {
            return true;
        }
    }

    return false;
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
            if (!matchesTemplate(word, template)) {
                return null;
            }
            const result = canMakeWordWithTemplate(letters, word, template);
            if (!result.canMake) {
                return null;
            }
            return { word, wildcardTypes: result.wildcardTypes };
        })
        .filter(result => result !== null);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findAnagrams };
}