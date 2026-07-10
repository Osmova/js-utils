
# JS Utils

Lightweight TS/JS utility lib with common helper functions.

## Installation

```bash
pnpm add @osmova/js-utils
# or
npm install @osmova/js-utils
```

## Usage & tree-shaking

The package ships ESM + CJS, has zero runtime dependencies and declares `"sideEffects": false`, so bundlers only keep what you import:

```ts
import { debounce, slugify } from '@osmova/js-utils';
```

Every category is also exposed as a subpath for narrower imports:

```ts
import { pick, omit } from '@osmova/js-utils/objects';
import { promiseAllLimit } from '@osmova/js-utils/async';
```

## API Reference

### Numbers

| Function | Description | Example |
|----------|-------------|---------|
| `formatCurrency(value, currency?, locale?)` | Formats number as currency with locale support | `formatCurrency(1234.56)` → `"1 234,56 €"` |
| `formatNumber(value, options?)` | Formats number with locale-specific separators | `formatNumber(1234.56, {decimals: 2})` → `"1 234,56"` |
| `formatPercent(value, options?)` | Formats number as percentage | `formatPercent(0.1556)` → `"15,56 %"` |
| `clamp(value, min, max)` | Clamps number between min and max values | `clamp(150, 0, 100)` → `100` |
| `randomInt(min, max)` | Generates random integer between min and max (inclusive) | `randomInt(1, 10)` → `7` |
| `roundTo(value, decimals?)` | Rounds to fixed decimals, returns a number | `roundTo(1.005, 2)` → `1.01` |
| `formatBytes(bytes, options?)` | Human-readable byte size (decimal or binary units) | `formatBytes(1536)` → `"1.5 KB"` |

### Arrays

| Function | Description | Example |
|----------|-------------|---------|
| `chunk(array, size)` | Splits array into chunks of specified size | `chunk([1,2,3,4,5], 2)` → `[[1,2], [3,4], [5]]` |
| `uniq(array)` | Removes duplicate values from array | `uniq([1,2,2,3])` → `[1,2,3]` |
| `unique(array)` | Alias for uniq | `unique([1,2,2,3])` → `[1,2,3]` |
| `compact(array)` | Removes falsy values from array | `compact([0,1,false,2,'',3])` → `[1,2,3]` |
| `sortBy(array, iteratee, order?)` | Sorts array by property or function | `sortBy([{age:30},{age:20}], 'age')` → `[{age:20},{age:30}]` |
| `range(start, end?, step?)` | Creates array of numbers from start to end | `range(5)` → `[0,1,2,3,4]` |
| `intersection(array, other)` | Values present in both arrays | `intersection([1,2,3], [2,3,4])` → `[2,3]` |
| `difference(array, other)` | Values of first array missing from second | `difference([1,2,3], [2,3,4])` → `[1]` |
| `partition(array, predicate)` | Splits into [matching, rest] in one pass | `partition([1,2,3,4], n => n%2===0)` → `[[2,4],[1,3]]` |
| `zip(a, b)` | Pairs two arrays index by index | `zip(['a','b'], [1,2])` → `[['a',1],['b',2]]` |
| `toggleItem(array, item, options?)` | Adds item if absent, removes if present (immutable) | `toggleItem([1,2], 2)` → `[1]` |
| `moveItem(array, from, to)` | Moves an item to another position (immutable) | `moveItem(['a','b','c'], 0, 2)` → `['b','c','a']` |

### Strings

| Function | Description | Example |
|----------|-------------|---------|
| `capitalize(str)` | Capitalizes first letter | `capitalize('hello')` → `"Hello"` |
| `camelize(str, options?)` | Converts to camelCase | `camelize('hello-world')` → `"helloWorld"` |
| `camelToSnakeCase(str)` | Converts camelCase to snake_case | `camelToSnakeCase('helloWorld')` → `"hello_world"` |
| `snakeToCamelCase(str)` | Converts snake_case to camelCase | `snakeToCamelCase('hello_world')` → `"helloWorld"` |
| `humanize(str)` | Converts string to human-readable format | `humanize('firstName')` → `"First Name"` |
| `slugify(str)` | Creates URL-friendly slug | `slugify('Hello World!')` → `"hello_world"` |
| `basename(path, sep?)` | Gets filename from path | `basename('/path/to/file.txt')` → `"file.txt"` |
| `stripExtension(str)` | Removes file extension | `stripExtension('file.txt')` → `"file"` |
| `isValidURL(str, opts?)` | Validates URL format | `isValidURL('https://example.com')` → `true` |
| `nl2br(str, replaceMode?, isXhtml?)` | Converts newlines to HTML breaks | `nl2br('line1\nline2')` → `"line1<br>line2"` |
| `getStringBetween(str, start, end)` | Extracts string between delimiters | `getStringBetween('a[b]c', '[', ']')` → `"b"` |
| `truncate(str, length, options?)` | Truncates string to specified length | `truncate('Hello World', 5)` → `"Hello..."` |
| `isEmail(str)` | Validates email format | `isEmail('test@example.com')` → `true` |
| `isFilePath(str, options?)` | Heuristic check whether a string looks like a file path | `isFilePath('./src/index.ts')` → `true` |
| `stripHtml(html)` | Strips HTML tags to plain text | `stripHtml('<b>Hi</b>')` → `"Hi"` |
| `trimStr(str, char?, options?)` | Trims a specific character from start/end | `trimStr('--a--', '-')` → `"a"` |
| `escapeRegExp(str)` | Escapes regex metacharacters | `escapeRegExp('1.5+2')` → `"1\\.5\\+2"` |
| `escapeHtml(str)` | Escapes HTML special characters | `escapeHtml('<b>')` → `"&lt;b&gt;"` |
| `parseStringValue(value, options?)` | Parses a string to bool/number/JSON when possible | `parseStringValue('42')` → `42` |
| `composePath(...parts)` | Joins path segments | `composePath('api', 'users', '1')` → `"api/users/1"` |
| `safeJsonParse(value, fallback?, options?)` | JSON.parse without throwing | `safeJsonParse('{oops', {})` → `{}` |
| `rgb2hex(rgb)` | ⚠️ Deprecated — use colors `parseRgb` + `rgbToHex` | `rgb2hex('rgb(255, 0, 0)')` → `"#ff0000"` |
| `composeURL(...parts)` | ⚠️ Deprecated — use `composePath` | `composeURL('api', 'users', '1')` → `"api/users/1"` |
| `generatePassword(opts?)` | Generates secure password (crypto, unbiased) | `generatePassword({length: 16})` → `"aB3$kL9..."` |

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
| `containsFiles(input)` | Checks if input contains File/Blob instances | `containsFiles({avatar: new File(...)})` → `true` |
| `deepClone(obj)` | Deep clone object | `deepClone({a: {b: 1}})` → `{a: {b: 1}}` |
| `deepFind(input, predicate)` | Recursively finds first matching value | `deepFind({a: {b: 1}}, v => v === 1)` → `1` |
| `deepSome(input, predicate)` | Recursively checks if any value matches | `deepSome([1, [2, [3]]], v => v === 3)` → `true` |
| `flattenObject(obj, prefix?, result?, options?)` | Flattens nested object | `flattenObject({a: {b: 1}})` → `{'a.b': 1}` |
| `getByPath(obj, path, defaultValue?)` | Gets value by dot notation path | `getByPath({a: {b: 1}}, 'a.b')` → `1` |
| `isset(target, options?)` | Checks if value is set (not null/undefined) | `isset({a: 1})` → `true` |
| `toFormData(input, options?)` | Converts input to FormData | `toFormData({name: 'John'})` → `FormData` |
| `pick(obj, keys)` | Creates new object with only specified keys | `pick({a:1,b:2,c:3}, ['a','c'])` → `{a:1,c:3}` |
| `omit(obj, keys)` | Creates new object excluding specified keys | `omit({a:1,b:2,c:3}, ['b'])` → `{a:1,c:3}` |
| `toArray(input, options?)` | Converts various inputs to arrays (objects with numeric keys, strings, Set, Map) | `toArray({"0":"a","1":"b"})` → `["a","b"]` |
| `isArrayLike(value)` | Checks if value is array-like (array or object with numeric keys) | `isArrayLike({"0":"a"})` → `true` |
| `setByPath(obj, path, value, options?)` | Sets nested value by dot path, creating containers | `setByPath({}, 'a.b', 1)` → `{a:{b:1}}` |
| `mapValues(obj, fn)` | Maps object values, keeping keys | `mapValues({a:1}, v => v*10)` → `{a:10}` |
| `invert(obj)` | Swaps keys and values | `invert({a:1})` → `{'1':'a'}` |

### Dates

| Function | Description | Example |
|----------|-------------|---------|
| `parseDate(input)` | Parses various date formats | `parseDate('2023-01-01')` → `Date` |
| `parsePeriod(period)` | Parses period strings | `parsePeriod('2023-01')` → `{start: Date, end: Date}` |
| `addDays(date, days)` | Returns new date shifted by N days | `addDays(new Date('2026-01-01'), 7)` → `Date` |
| `isSameDay(a, b)` | Checks if two dates share a calendar day | `isSameDay(d1, d2)` → `true` |
| `startOfDay(date, options?)` | New date at 00:00:00.000 (local or UTC) | `startOfDay(new Date())` → `Date` |
| `endOfDay(date, options?)` | New date at 23:59:59.999 (local or UTC) | `endOfDay(new Date())` → `Date` |
| `diffDays(a, b, options?)` | Signed calendar-day difference (b - a) | `diffDays(jan1, jan8)` → `7` |
| `timeAgo(date, options?)` | Relative time via Intl.RelativeTimeFormat | `timeAgo(Date.now() - 180000, {locale:'en-US'})` → `"3 minutes ago"` |

### Async

| Function | Description | Example |
|----------|-------------|---------|
| `sleep(ms)` | Promise-based delay | `await sleep(1000)` |
| `retry(fn, maxAttempts?, baseDelay?)` | Retries function with exponential backoff | `await retry(() => fetch('/api'), 3, 1000)` |
| `promiseAllLimit(tasks, limit)` | Execute tasks with a concurrency limit (pass factories so tasks start lazily) | `await promiseAllLimit([() => fetch(a), () => fetch(b)], 2)` |
| `withTimeout(promise, timeoutMs, timeoutMessage?)` | Adds timeout to promise | `await withTimeout(fetch('/api'), 5000)` |
| `deferred()` | Promise with exposed resolve/reject | `const d = deferred(); d.resolve(42)` |
| `waitFor(predicate, options?)` | Polls until a (sync/async) condition is true | `await waitFor(() => ready, {timeout: 3000})` |

### Browser

| Function | Description | Example |
|----------|-------------|---------|
| `downloadBlob(blob, filename, options?)` | Downloads a Blob as a file in browser | `downloadBlob(csvBlob, 'data.csv')` |
| `downloadUrl(url, filename?, options?)` | Downloads a file from URL | `downloadUrl('https://example.com/file.pdf', 'doc.pdf')` |
| `openBlob(blob, options?)` | Opens Blob in new browser tab | `openBlob(pdfBlob)` |
| `handleBlobDownload(blob, filename, options?)` | Download or open Blob based on options | `handleBlobDownload(blob, 'file.pdf', {download: true})` |
| `dataUrlToBlob(dataUrl)` | Converts data URL to Blob | `dataUrlToBlob('data:text/plain;base64,...')` |
| `copyToClipboard(text, options?)` | Copies text (Clipboard API + textarea fallback) | `await copyToClipboard('hello')` → `true` |
| `blobToDataUrl(blob)` | Converts Blob to data URL (inverse of dataUrlToBlob) | `await blobToDataUrl(blob)` → `"data:...;base64,..."` |

### Functions

| Function | Description | Example |
|----------|-------------|---------|
| `debounce(func, delay, options?)` | Debounces function execution with optional immediate mode | `debounce(() => console.log('hi'), 300)` |
| `throttle(func, delay, options?)` | Throttles function execution to limit frequency | `throttle(() => console.log('scroll'), 1000)` |
| `loadExternalScript(src, opts?)` | Dynamically loads external scripts (browser only) | `await loadExternalScript('https://cdn.example.com/lib.js')` |
| `genUuid(options?)` | Generates UUID with version support (v1 or v4) | `genUuid({version: 4})` → `"550e8400-e29b-41d4-a716-446655440000"` |
| `once(func)` | Wraps a function so it only ever runs once | `const init = once(setup)` |
| `memoize(func, options?)` | Caches results per argument list (options object or resolver fn) | `const fast = memoize(slowFn)` |

### Colors

| Function | Description | Example |
|----------|-------------|---------|
| `lightenColor(hex, percent)` | Lightens a hex color | `lightenColor('#207dd3', 20)` → `"#53B0FF"` |
| `darkenColor(hex, percent)` | Darkens a hex color | `darkenColor('#207dd3', 20)` → `"#004AA0"` |
| `hexToRgb(hex)` | Hex to RGB object | `hexToRgb('#FF0000')` → `{r:255,g:0,b:0}` |
| `rgbToHex(r, g, b)` | RGB channels to hex string | `rgbToHex(255, 0, 0)` → `"#FF0000"` |
| `hexToRgbString(hex)` | Hex to `rgb(...)` string | `hexToRgbString('#FF0000')` → `"rgb(255, 0, 0)"` |
| `parseRgb(rgb)` | Parses `rgb()/rgba()` strings | `parseRgb('rgb(255,0,0)')` → `{r:255,g:0,b:0}` |
| `getLuminance(hex)` | WCAG relative luminance (0-1) | `getLuminance('#FFFFFF')` → `1` |
| `isLightColor(hex, threshold?)` | Light/dark check | `isLightColor('#FFFFFF')` → `true` |
| `getContrastText(hex)` | Black or white text for a background | `getContrastText('#000000')` → `"#FFFFFF"` |

### Random

| Function | Description | Example |
|----------|-------------|---------|
| `shuffleArray(array)` | Fisher-Yates shuffle (returns new array) | `shuffleArray([1,2,3])` → `[3,1,2]` |
| `generateSeed()` | Timestamp-based unique seed string | `generateSeed()` → `"1780..."` |
| `pickOne(array)` | Random single element | `pickOne([1,2,3])` → `2` |
| `pickRandom(array, count)` | N random unique elements | `pickRandom([1,2,3,4], 2)` → `[4,1]` |

### Validation

| Function | Description | Example |
|----------|-------------|---------|
| `parseLanguageCode(code, options?)` | Extracts language code from locale | `parseLanguageCode('en-US')` → `'en'` |
| `parseBool(value)` | Parses boolean from various formats | `parseBool('1')` → `true`, `parseBool(0)` → `false` |
| `isValidCss(prop, val)` | Validates CSS property and value | `isValidCss('color', '#ff0000')` → `true` |
| `isValidHex(color)` | Validates hex color format | `isValidHex('#ff0000')` → `true` |
| `isValidColor(color)` | Validates color format (hex, named, rgb, hsl) | `isValidColor('red')` → `true` |

## Testing

Run tests using the following commands:

```bash
# Unit tests (jest)
pnpm test

# Run Node.js smoke tests
pnpm test:node

# Run browser tests (automated with Puppeteer)
pnpm test:browser

# Run all smoke tests
pnpm test:all
```
