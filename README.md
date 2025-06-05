# use-mathjs

A React hook built with [mathjs](https://mathjs.org) for safely evaluating math expressions in your React apps.

---

## Features

- Evaluate math expressions (e.g. `a + b`, `2 * x + 3`)
- Validate results and access error state
- Debounce evaluation for performance
- Flexible scope: supports plain objects and Map-like objects (including ES6 Map)

---

## Installation

```bash
npm install use-mathjs
```

> ⚠️ Requires `react` version 16.8.0 or above (Hooks support).

---

## Scope Type Support

The `scope` parameter for `evaluate`/`evaluateSync` supports:

- **Plain objects**: `{ a: 1, b: 2 }`
- **Map-like objects**: Any object implementing `get(key: string)`, `set(key: string, value: unknown)`, `has(key: string)`, and `keys()` (including ES6 `Map`)

This matches the flexibility described in the [mathjs documentation](https://mathjs.org/docs/expressions/parsing.html#scope).

**Type definition:**
```typescript
export interface MapLike {
  get(key: string): unknown;
  set(key: string, value: unknown): unknown;
  has(key: string): boolean;
  keys(): IterableIterator<string> | string[];
}

export type ScopeType = Record<string, unknown> | MapLike;
```

**Examples:**
```tsx
evaluate('a + b', { a: 1, b: 2 }) // plain object
evaluate('a + b', new Map([['a', 1], ['b', 2]])) // ES6 Map (Map-like)
evaluate('a + b', customMapLike) // any object with get/set/has/keys
```

---

## Usage Example

```tsx
import { useMath } from 'use-mathjs';

function Calculator() {
  const { state, evaluate, evaluateSync, reset } = useMath({
    initialResult: { result: 0, error: null, isValid: true },
    errorMessageMap: (err) => `Custom error: ${err instanceof Error ? err.message : String(err)}`,
    debounceMs: 300,
  });

  return (
    <div>
      <button onClick={() => evaluate('a + b', { a: 1, b: 2 })}>Evaluate a + b</button>
      <button onClick={() => {
        const res = evaluateSync('2 * 3');
        alert(res.result);
      }}>Sync 2 * 3</button>
      <div>Result: {state.result}</div>
      <div>Error: {state.error}</div>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

## API

### `useMath(options?)`

#### Options

- `initialResult` — Initial state (default: `{ result: null, error: null, isValid: null }`)
- `onValidationComplete(result)` — Callback after evaluation
- `errorMessageMap(error)` — Custom error message mapping
- `debounceMs` — Debounce evaluation in milliseconds

#### Return

- `state` — Current evaluation state `{ result, error, isValid }`
- `evaluate(expr, scope?)` — Perform evaluation (debounced if set)
- `evaluateSync(expr, scope?)` — Synchronously evaluate expression
- `reset()` — Reset state

---

## License

MIT
