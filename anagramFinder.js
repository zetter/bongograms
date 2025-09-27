function matchesTemplate(word, template) {
    const hasTemplate = template.some(letter => letter !== '');
    if (!hasTemplate) return true;
    if (word.length < 3 || word.length > 5) return false;

    if (word.length < 5) {
        for (let i = 0; i < template.length; i++) {
            if (template[i] !== '') {
                if (i === 0) {
                    if (word[0] !== template[0]) {
                        return false;
                    }
                } else if (i === 4) {
                    if (word[word.length - 1] !== template[4]) {
                        return false;
                    }
                } else {
                    if (!word.includes(template[i])) {
                        return false;
                    }
                }
            }
        }
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

function findAnagrams(wordlist, template, letters) {
    return wordlist.filter(word =>
        matchesTemplate(word, template) &&
        canMakeWordWithTemplate(letters, word, template)
    );
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findAnagrams };
}