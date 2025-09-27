const { test } = require('node:test');
const assert = require('node:assert');
const { findAnagrams } = require('./anagramFinder.js');

test('finds basic anagrams without template', () => {
    const wordlist = ['cat', 'act', 'dog', 'god'];
    const template = ['', '', '', '', ''];
    const letters = 'tac';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['act', 'cat']);
});

test('finds anagrams with wildcard', () => {
    const wordlist = ['cat', 'bat', 'dog'];
    const template = ['', '', '', '', ''];
    const letters = 'c?t';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['cat']);
});

test('finds 5-letter words matching template position', () => {
    const wordlist = ['count', 'tooth', 'mount'];
    const template = ['', 'o', '', '', 't'];
    const letters = 'cun';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result, ['count']);
});

test('finds 3-letter words with templates', () => {
    const wordlist = ['cat', 'act', 'dog'];
    const template = ['', 'c', '', '', ''];
    const letters = 'at';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['act', 'cat']);
});

test('finds 4-letter with templates', () => {
    const wordlist = ['dog', 'gods', 'cats'];
    const template = ['', '', 'd', '', ''];
    const letters = 'ogs';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['dog', 'gods']);
});

test('returns empty array when no matches', () => {
    const wordlist = ['cat', 'dog'];
    const template = ['', '', '', '', ''];
    const letters = 'xyz';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result, []);
});

test('works with empty wordlist', () => {
    const wordlist = [];
    const template = ['', '', '', '', ''];
    const letters = 'cat';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result, []);
});

test('template filters out words that are too short or too long', () => {
    const wordlist = ['at', 'cat', 'verylongword'];
    const template = ['c', '', '', '', ''];
    const letters = 'at';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result, ['cat']);
});

test('template with first position matches correctly for 5-letter words', () => {
    const wordlist = ['carat', 'tacos', 'coast'];
    const template = ['c', '', '', '', ''];
    const letters = 'artos';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['coast'].sort());
});

test('empty template returns all matching anagrams', () => {
    const wordlist = ['cat', 'act', 'tac', 'dog'];
    const template = ['', '', '', '', ''];
    const letters = 'cat';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['act', 'cat', 'tac']);
});

test('templates work with wildcards', () => {
    const wordlist = ['cat', 'dog'];
    const template = ['c', '', '', '', ''];
    const letters = '???';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['cat']);
});


test('cannot have letters before the start of the template', () => {
    const wordlist = ['ack', 'back', 'cab'];
    const template = ['', 'c', '', '', ''];
    const letters = 'bak';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['ack', 'cab']);
});

test('cannot have letters before the start of the template when using wildcards', () => {
    const wordlist = ['cat', 'act', 'tac'];
    const template = ['c', '', '', '', ''];
    const letters = '???';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['cat']);
});

test('cannot have letters after the end of the template', () => {
    const wordlist = ['ack', 'back', 'cab'];
    const template = ['', '', '', 'a', ''];
    const letters = 'bck';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['cab']);
});

test('cannot have letters after the end of the template when using wildcards', () => {
    const wordlist = ['cat', 'ate', 'tac'];
    const template = ['', '', '', '', 't'];
    const letters = '???';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['cat']);
});

test('should not insert letter between template characters', () => {
    const wordlist = ['bob', 'boa', 'abb'];
    const template = ['', 'b', 'b', '', ''];
    const letters = 'ao';

    const result = findAnagrams(wordlist, template, letters);

    assert.deepStrictEqual(result.sort(), ['abb']);
})