
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
| `nl2br(str, replaceMode?, isXhtml?)` | Converts newlines to HTML breaks | `nl2br('line1\nline2')` → `"line1<br>line2"` |
| `getStringBetween(str, start, end)` | Extracts string between delimiters | `getStringBetween('a[b]c', '[', ']')` → `"b"` |
| `truncate(str, length, options?)` | Truncates string to specified length | `truncate('Hello World', 5)` → `"Hello..."` |
| `isEmail(str)` | Validates email format | `isEmail('test@example.com')` → `true` |
| `rgb2hex(rgb)` | Converts RGB to hex color | `rgb2hex('rgb(255, 0, 0)')` → `"#ff0000"` |
| `composeURL(...parts)` | Joins URL parts | `composeURL('api', 'users', '1')` → `"api/users/1"` |
| `generatePassword(opts?)` | Generates secure password | `generatePassword({length: 16})` → `"aB3$kL9..."` |

### Objects

| Function | Description | Example |
|----------|-------------|---------|
| `isObject(item)` | Checks if value is object | `isObject({})` → `true` |
| `isEmpty(value, opts?)` | Checks if value is empty | `isEmpty([])` → `true` |
| `isNumeric(value)` | Checks if value is numeric | `isNumeric('123')` → `true` |
| `softMerge(base, values, options?)` | Shallow merge objects | `softMerge({a: 1}, {b: 2})` → `{a: 1, b: 2}` |
| `deepMerge(...objects)` | Deep merge multiple objects | `deepMerge({a: {x: 1}}, {a: {y: 2}})` → `{a: {x: 1, y: 2}}` |
| `objectFilter(obj, predicate)` | Filters object properties | `objectFilter({a: 1, b: 2}, v => v > 1)` → `{b: 2}` |
| `groupBy(array, keys)` | Groups array by property/properties | `groupBy([{type: 'A'}, {type: 'B'}], 'type')` |
| `valueByIndex(object, index)` | Gets value by numeric index | `valueByIndex({a: 1, b: 2}, 0)` → `1` |
| `indexByKey(object, key)` | Gets index of key in object | `indexByKey({a: 1, b: 2}, 'b')` → `1` |
| `keyByValue(object, value)` | Gets key by value | `keyByValue({a: 1, b: 2}, 2)` → `'b'` |
| `removeItemOnce(array, value)` | Removes first occurrence from array | `removeItemOnce([1, 2, 1], 1)` → `[2, 1]` |
| `removeUnsetValues(obj, options?)` | Removes null/undefined values | `removeUnsetValues({a: 1, b: null})` → `{a: 1}` |
| `objectToFormData(obj, params?)` | Converts object to FormData | `objectToFormData({name: 'John'})` → `FormData` |
| `diff(obj1, obj2, opts?)` | Compares two objects | `diff({a: 1}, {a: 2})` → `{a: {from: 1, to: 2}}` |
| `clone(obj, options?)` | Shallow/deep clone object | `clone({a: {b: 1}})` → `{a: {b: 1}}` |
| `deepClone(obj)` | Deep clone object | `deepClone({a: {b: 1}})` → `{a: {b: 1}}` |
| `flattenObject(obj, prefix?, result?, options?)` | Flattens nested object | `flattenObject({a: {b: 1}})` → `{'a.b': 1}` |
| `getByPath(obj, path, defaultValue?)` | Gets value by dot notation path | `getByPath({a: {b: 1}}, 'a.b')` → `1` |
| `isset(target, options?)` | Checks if value is set (not null/undefined) | `isset({a: 1})` → `true` |
| `toFormData(input, options?)` | Converts input to FormData | `toFormData({name: 'John'})` → `FormData` |

### Dates

| Function | Description | Example |
|----------|-------------|---------|
| `parseDate(input)` | Parses various date formats | `parseDate('2023-01-01')` → `Date` |
| `parsePeriod(period)` | Parses period strings | `parsePeriod('2023-01')` → `{start: Date, end: Date}` |

### Async

| Function | Description | Example |
|----------|-------------|---------|
| `sleep(ms)` | Promise-based delay | `await sleep(1000)` |
| `retry(fn, maxAttempts?, baseDelay?)` | Retries function with exponential backoff | `await retry(() => fetch('/api'), 3, 1000)` |
| `promiseAllLimit(promises, limit)` | Execute promises with concurrency limit | `await promiseAllLimit([p1, p2, p3], 2)` |
| `withTimeout(promise, timeoutMs, timeoutMessage?)` | Adds timeout to promise | `await withTimeout(fetch('/api'), 5000)` |

### Functions

| Function | Description | Example |
|----------|-------------|---------|
| `debounce(func, delay, options?)` | Debounces function execution with optional immediate mode | `debounce(() => console.log('hi'), 300)` |
| `loadExternalScript(src, opts?)` | Dynamically loads external scripts (browser only) | `await loadExternalScript('https://cdn.example.com/lib.js')` |
| `genUuid(options?)` | Generates UUID with version support (v1 or v4) | `genUuid({version: 4})` → `"550e8400-e29b-41d4-a716-446655440000"` |

### Validation

| Function | Description | Example |
|----------|-------------|---------|
| `parseLanguageCode(code, options?)` | Extracts language code from locale | `parseLanguageCode('en-US')` → `'en'` |
| `isValidCss(prop, val)` | Validates CSS property and value | `isValidCss('color', '#ff0000')` → `true` |
| `isValidHex(color)` | Validates hex color format | `isValidHex('#ff0000')` → `true` |
| `isValidColor(color)` | Validates color format (hex, named, rgb, hsl) | `isValidColor('red')` → `true` |

## Testing

Run tests using the following commands:

```bash
# Run Node.js tests
yarn test:node

# Run browser tests (automated with Puppeteer)
yarn test:browser

# Run all tests
yarn test:all
```
