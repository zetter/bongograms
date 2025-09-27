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
        let matches = true;
        for (let i = firstNonEmpty; i <= lastNonEmpty; i++) {
            const wordPos = startPos + (i - firstNonEmpty);
            if (template[i] !== '' && word[wordPos] !== template[i]) {
                matches = false;
                break;
            }
        }
        if (matches) return true;
    }

    return false;
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

function findAnagrams(wordlist, template, letters) {
    return wordlist.filter(word =>
        matchesTemplate(word, template) &&
        canMakeWordWithTemplate(letters, word, template)
    );
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findAnagrams };
}