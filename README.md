# use-mathjs

A React hook built with [mathjs](https://mathjs.org) for safely evaluating math expressions in your React apps.

---

## Features

- Evaluate math expressions (e.g. `a + b`, `2 * x + 3`)
- Validate results and access error state
- Debounce calculation for performance

---

## Installation

```bash
npm install use-mathjs
```

> ⚠️ Requires `react` version 16.8.0 or above (Hooks support).

---

## Usage Example

```tsx
import { useMath } from 'use-mathjs';

function Calculator() {
  const { state, calculate, calculateSync, reset } = useMath({
    initialResult: { result: 0, error: null, isValid: true },
    errorMessageMap: (err) => `Custom error: ${err instanceof Error ? err.message : String(err)}`,
    debounceMs: 300,
  });

  return (
    <div>
      <button onClick={() => calculate('a + b', { a: 1, b: 2 })}>Calculate a + b</button>
      <button onClick={() => {
        const res = calculateSync('2 * 3');
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
- `onValidationComplete(result)` — Callback after calculation
- `errorMessageMap(error)` — Custom error message mapping
- `debounceMs` — Debounce calculation in milliseconds

#### Return

- `state` — Current calculation state `{ result, error, isValid }`
- `calculate(expr, scope?)` — Perform calculation (debounced if set)
- `calculateSync(expr, scope?)` — Synchronously calculate expression
- `reset()` — Reset state

---

## License

MIT
