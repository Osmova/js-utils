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

    console.log('📦 String utilities:');
    test('capitalize', () => {
        const result = utils.capitalize('hello');
        if (result !== 'Hello') throw new Error(`Expected "Hello", got "${result}"`);
    });

    test('slugify', () => {
        const result = utils.slugify('Hello World!');
        if (result !== 'hello_world') throw new Error(`Expected "hello_world", got "${result}"`);
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