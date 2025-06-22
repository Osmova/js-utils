
# JS Utils

Lightweight TS/JS utility lib with common helper functions.

## Installation

`npm install js-utils`
# or
`yarn add js-utils`

## API Reference

### Strings

| Function | Description | Example |
|----------|-------------|---------|
| `capitalize(str)` | Capitalizes first letter | `capitalize('hello')` → `"Hello"` |
| `camelize(str, options?)` | Converts to camelCase | `camelize('hello-world')` → `"helloWorld"` |
| `camelToSnakeCase(str)` | Converts camelCase to snake_case | `camelToSnakeCase('helloWorld')` → `"hello_world"` |
| `slugify(str)` | Creates URL-friendly slug | `slugify('Hello World!')` → `"hello_world"` |
| `basename(path, sep?)` | Gets filename from path | `basename('/path/to/file.txt')` → `"file.txt"` |
| `stripExtension(str)` | Removes file extension | `stripExtension('file.txt')` → `"file"` |
| `isValidURL(str, opts?)` | Validates URL format | `isValidURL('https://example.com')` → `true` |
| `composeURL(...parts)` | Joins URL parts | `composeURL('api', 'users', '1')` → `"api/users/1"` |
| `generatePassword(opts?)` | Generates secure password | `generatePassword({length: 16})` → `"aB3$kL9..."` |

### Objects

| Function | Description | Example |
|----------|-------------|---------|
| `isObject(item)` | Checks if value is object | `isObject({})` → `true` |
| `isEmpty(value)` | Checks if value is empty | `isEmpty([])` → `true` |
| `isNumeric(value)` | Checks if value is numeric | `isNumeric('123')` → `true` |
| `softMerge(target, source)` | Shallow merge objects | `softMerge({a: 1}, {b: 2})` → `{a: 1, b: 2}` |
| `deepMerge(target, source)` | Deep merge objects | `deepMerge({a: {x: 1}}, {a: {y: 2}})` → `{a: {x: 1, y: 2}}` |
| `objectFilter(obj, predicate)` | Filters object properties | `objectFilter({a: 1, b: 2}, v => v > 1)` → `{b: 2}` |
| `groupBy(array, key)` | Groups array by property | `groupBy([{type: 'A'}, {type: 'B'}], 'type')` |
| `removeUnsetValues(obj)` | Removes null/undefined values | `removeUnsetValues({a: 1, b: null})` → `{a: 1}` |
| `flattenObject(obj, prefix?)` | Flattens nested object | `flattenObject({a: {b: 1}})` → `{'a.b': 1}` |
| `equal(a, b)` | Deep equality check | `equal({a: 1}, {a: 1})` → `true` |

### Dates

| Function | Description | Example |
|----------|-------------|---------|
| `parseDate(input)` | Parses various date formats | `parseDate('2023-01-01')` → `Date` |
| `parsePeriod(period)` | Parses period strings | `parsePeriod('2023-01')` → `{start: Date, end: Date}` |

### Async

| Function | Description | Example |
|----------|-------------|---------|
| `delay(ms)` | Promise-based delay | `await delay(1000)` |
| `retry(fn, options?)` | Retries function on failure | `await retry(() => fetch('/api'))` |
| `timeout(promise, ms)` | Adds timeout to promise | `await timeout(fetch('/api'), 5000)` |
| `asyncMap(array, fn)` | Parallel async map | `await asyncMap([1,2,3], async x => x * 2)` |
| `asyncFilter(array, fn)` | Parallel async filter | `await asyncFilter([1,2,3], async x => x > 1)` |

### Validation

| Function | Description | Example |
|----------|-------------|---------|
| `parseLanguageCode(code)` | Parses language codes | `parseLanguageCode('en-US')` → `{language: 'en', region: 'US'}` |
| `isValidCss(selector)` | Validates CSS selector | `isValidCss('.class')` → `true` |
| `isValidHex(color)` | Validates hex color | `isValidHex('#ff0000')` → `true` |
| `isValidColor(color)` | Validates color format | `isValidColor('red')` → `true` |
