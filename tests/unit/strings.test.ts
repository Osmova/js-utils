import {
    escapeRegExp,
    escapeHtml,
    trimStr,
    truncate,
    stripHtml,
    generatePassword,
    capitalize,
    slugify,
    parseStringValue,
    humanize
} from '../../src/strings/index.js';

describe('escapeRegExp', () => {
    it('escapes regex metacharacters', () => {
        expect(escapeRegExp('1.5+2*(a|b)')).toBe('1\\.5\\+2\\*\\(a\\|b\\)');
        expect(new RegExp(escapeRegExp('a.b')).test('a.b')).toBe(true);
        expect(new RegExp(escapeRegExp('a.b')).test('axb')).toBe(false);
    });
});

describe('escapeHtml', () => {
    it('escapes markup characters', () => {
        expect(escapeHtml('<b>"a" & \'b\'</b>'))
            .toBe('&lt;b&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/b&gt;');
    });
});

describe('trimStr', () => {
    it('trims literal characters, not regex classes (regression)', () => {
        expect(trimStr('d1ad1', 'd')).toBe('1ad1');
        expect(trimStr('1ad1', 'd')).toBe('1ad1');
        expect(trimStr('..a..', '.')).toBe('a');
        expect(trimStr('xxaxx', 'x')).toBe('a');
    });

    it('respects start/end options', () => {
        expect(trimStr('--a--', '-', { end: false })).toBe('a--');
        expect(trimStr('--a--', '-', { start: false })).toBe('--a');
    });
});

describe('truncate', () => {
    it('truncates on word boundaries by default', () => {
        expect(truncate('hello brave world', 12)).toBe('hello...');
    });

    it('handles length shorter than the ending (regression)', () => {
        expect(truncate('hello world', 2)).toBe('..');
        expect(truncate('hello world', 3)).toBe('...');
    });

    it('returns short strings unchanged', () => {
        expect(truncate('hi', 10)).toBe('hi');
    });
});

describe('stripHtml', () => {
    it('strips tags and decodes entities (node fallback)', () => {
        expect(stripHtml('<p>Hello <b>World</b> &amp; you</p>')).toBe('Hello World & you');
        expect(stripHtml(null)).toBe('');
    });
});

describe('generatePassword', () => {
    it('generates requested length with required character classes', () => {
        for (let i = 0; i < 20; i++) {
            const pw = generatePassword({ length: 16 });
            expect(pw).toHaveLength(16);
            expect(pw).toMatch(/[a-z]/);
            expect(pw).toMatch(/[A-Z]/);
            expect(pw).toMatch(/[0-9]/);
            expect(pw).toMatch(/[!@#$%^&*]/);
        }
    });

    it('omits symbols when disabled', () => {
        const pw = generatePassword({ length: 12, symbols: false });
        expect(pw).toMatch(/^[a-zA-Z0-9]{12}$/);
    });
});

describe('misc string utils', () => {
    it('capitalize / slugify / humanize', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(slugify('Héllo World!')).toBe('hello_world');
        expect(humanize('user_first_name')).toBe('User First Name');
    });

    it('parseStringValue', () => {
        expect(parseStringValue('true')).toBe(true);
        expect(parseStringValue('42')).toBe(42);
        expect(parseStringValue('4.5')).toBe(4.5);
        expect(parseStringValue('{"a":1}')).toEqual({ a: 1 });
        expect(parseStringValue('{invalid')).toBe('{invalid');
        expect(parseStringValue('plain')).toBe('plain');
    });
});
