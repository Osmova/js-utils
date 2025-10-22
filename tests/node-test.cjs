#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing js-utils in Node.js environment\n');

// Check if built version exists
const distPath = path.join(__dirname, '..', 'dist', 'index.cjs');
if (!fs.existsSync(distPath)) {
    console.error('❌ Built version not found. Please run "npm run build" first.');
    process.exit(1);
}

try {
    const utils = require(distPath);
    let passed = 0;
    let failed = 0;

    const test = (name, fn) => {
        try {
            fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            failed++;
        }
    };

    console.log('📦 Number utilities:');
    test('formatCurrency', () => {
        const result = utils.formatCurrency(1234.56);
        if (!result.includes('1') || !result.includes('234')) throw new Error(`Invalid currency format: ${result}`);
    });

    test('formatNumber', () => {
        const result = utils.formatNumber(1234.56, { decimals: 2 });
        if (!result.includes('1') || !result.includes('234')) throw new Error(`Invalid number format: ${result}`);
    });

    test('formatPercent', () => {
        const result = utils.formatPercent(0.1556);
        if (!result.includes('15') && !result.includes('16')) throw new Error(`Invalid percent format: ${result}`);
    });

    test('clamp', () => {
        if (utils.clamp(10, 0, 100) !== 10) throw new Error('clamp(10, 0, 100) should be 10');
        if (utils.clamp(-5, 0, 100) !== 0) throw new Error('clamp(-5, 0, 100) should be 0');
        if (utils.clamp(150, 0, 100) !== 100) throw new Error('clamp(150, 0, 100) should be 100');
    });

    test('randomInt', () => {
        const result = utils.randomInt(1, 10);
        if (result < 1 || result > 10) throw new Error(`randomInt(1, 10) out of range: ${result}`);
    });

    console.log('\n📦 Array utilities:');
    test('chunk', () => {
        const result = utils.chunk([1, 2, 3, 4, 5], 2);
        if (result.length !== 3) throw new Error(`Expected 3 chunks, got ${result.length}`);
        if (result[0].length !== 2) throw new Error('First chunk should have 2 elements');
        if (result[2].length !== 1) throw new Error('Last chunk should have 1 element');
    });

    test('uniq/unique', () => {
        const result = utils.uniq([1, 2, 2, 3, 3, 4]);
        if (result.length !== 4) throw new Error(`Expected 4 unique elements, got ${result.length}`);
        const result2 = utils.unique([1, 2, 2, 3]);
        if (result2.length !== 3) throw new Error('unique() should work as alias');
    });

    test('compact', () => {
        const result = utils.compact([0, 1, false, 2, '', 3, null, undefined, NaN]);
        if (result.length !== 3) throw new Error(`Expected 3 truthy values, got ${result.length}`);
        if (!result.includes(1) || !result.includes(2) || !result.includes(3)) {
            throw new Error('compact should keep 1, 2, 3');
        }
    });

    test('sortBy', () => {
        const arr = [{ age: 30 }, { age: 20 }, { age: 25 }];
        const result = utils.sortBy(arr, 'age');
        if (result[0].age !== 20) throw new Error('sortBy should sort ascending by default');
        const descResult = utils.sortBy(arr, 'age', 'desc');
        if (descResult[0].age !== 30) throw new Error('sortBy desc should sort descending');
    });

    test('range', () => {
        const result1 = utils.range(5);
        if (result1.length !== 5 || result1[0] !== 0 || result1[4] !== 4) {
            throw new Error('range(5) should be [0,1,2,3,4]');
        }
        const result2 = utils.range(1, 5);
        if (result2.length !== 4 || result2[0] !== 1 || result2[3] !== 4) {
            throw new Error('range(1,5) should be [1,2,3,4]');
        }
        const result3 = utils.range(0, 10, 2);
        if (result3.length !== 5 || result3[0] !== 0 || result3[4] !== 8) {
            throw new Error('range(0,10,2) should be [0,2,4,6,8]');
        }
    });

    console.log('\n📦 String utilities:');
    test('capitalize', () => {
        const result = utils.capitalize('hello');
        if (result !== 'Hello') throw new Error(`Expected "Hello", got "${result}"`);
    });

    test('slugify', () => {
        const result = utils.slugify('Hello World!');
        if (result !== 'hello_world') throw new Error(`Expected "hello_world", got "${result}"`);
    });

    test('snakeToCamelCase', () => {
        const result = utils.snakeToCamelCase('hello_world');
        if (result !== 'helloWorld') throw new Error(`Expected "helloWorld", got "${result}"`);
    });

    test('humanize', () => {
        const result1 = utils.humanize('firstName');
        if (result1 !== 'First Name') throw new Error(`Expected "First Name", got "${result1}"`);
        const result2 = utils.humanize('user_email');
        if (result2 !== 'User Email') throw new Error(`Expected "User Email", got "${result2}"`);
    });

    console.log('\n📦 Object utilities:');
    test('isObject', () => {
        if (!utils.isObject({})) throw new Error('Expected true for {}');
        if (utils.isObject('string')) throw new Error('Expected false for string');
    });

    test('isEmpty', () => {
        if (!utils.isEmpty([])) throw new Error('Expected true for []');
        if (utils.isEmpty([1])) throw new Error('Expected false for [1]');
    });

    test('pick', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = utils.pick(obj, ['a', 'c']);
        if (result.a !== 1 || result.c !== 3) throw new Error('pick should include selected keys');
        if ('b' in result) throw new Error('pick should exclude unselected keys');
    });

    test('omit', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = utils.omit(obj, ['b']);
        if (result.a !== 1 || result.c !== 3) throw new Error('omit should keep unselected keys');
        if ('b' in result) throw new Error('omit should exclude selected keys');
    });

    console.log('\n📦 Date utilities:');
    test('parseDate', () => {
        const result = utils.parseDate('2023-01-01');
        if (!(result instanceof Date)) throw new Error('Expected Date object');
    });

    console.log('\n📦 Async utilities:');
    test('sleep', async () => {
        const start = Date.now();
        await utils.sleep(100);
        const elapsed = Date.now() - start;
        if (elapsed < 90) throw new Error(`Sleep too short: ${elapsed}ms`);
    });

    console.log('\n📦 Function utilities:');
    test('debounce', () => {
        let called = 0;
        const fn = utils.debounce(() => called++, 50);
        fn();
        fn();
        fn();
        setTimeout(() => {
            if (called !== 1) throw new Error(`Expected 1 call, got ${called}`);
        }, 100);
    });

    test('throttle', () => {
        let called = 0;
        const fn = utils.throttle(() => called++, 100);
        fn(); // Called immediately (leading edge)
        fn(); // Throttled
        fn(); // Throttled
        if (called !== 1) throw new Error(`Expected 1 immediate call, got ${called}`);
    });

    test('genUuid v4', () => {
        const uuid = utils.genUuid();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) throw new Error(`Invalid UUID v4: ${uuid}`);
    });

    test('genUuid v1', () => {
        const uuid = utils.genUuid({ version: 1 });
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) throw new Error(`Invalid UUID v1: ${uuid}`);
    });

    test('loadExternalScript (Node.js error)', async () => {
        try {
            await utils.loadExternalScript('https://example.com/script.js');
            throw new Error('Should have thrown an error in Node.js');
        } catch (error) {
            if (!error.message.includes('browser environments')) {
                throw new Error(`Unexpected error: ${error.message}`);
            }
        }
    });

    console.log('\n📦 Validation utilities:');
    test('isValidHex', () => {
        if (!utils.isValidHex('#ff0000')) throw new Error('Expected true for #ff0000');
        if (utils.isValidHex('invalid')) throw new Error('Expected false for invalid');
    });

    test('parseBool', () => {
        if (utils.parseBool(1) !== true) throw new Error('parseBool(1) should be true');
        if (utils.parseBool('1') !== true) throw new Error('parseBool("1") should be true');
        if (utils.parseBool('true') !== true) throw new Error('parseBool("true") should be true');
        if (utils.parseBool(0) !== false) throw new Error('parseBool(0) should be false');
        if (utils.parseBool('0') !== false) throw new Error('parseBool("0") should be false');
        if (utils.parseBool('false') !== false) throw new Error('parseBool("false") should be false');
        if (utils.parseBool(null) !== false) throw new Error('parseBool(null) should be false');
    });

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('🎉 All tests passed!');
    }

} catch (error) {
    console.error('❌ Error loading utils:', error.message);
    process.exit(1);
}