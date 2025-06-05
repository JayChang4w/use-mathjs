import { compile } from 'mathjs';
import { useCallback, useRef, useState } from 'react';

/**
 * Scope for variables used in math expression evaluation.
 */
export type ScopeType = Record<string, unknown>;

/**
 * Result structure for math expression validation and calculation.
 */
export type CalculationResult = {
  result: number | null;
  error: string | null;
  isValid: boolean | null;
};

/**
 * Options for configuring the useMath hook.
 * @property {CalculationResult} [initialResult] - Initial state for the hook.
 * @property {(result: CalculationResult) => CalculationResult} [onValidationComplete] - Callback after validation.
 * @property {(error: unknown) => string} [errorMessageMap] - Custom error message mapping.
 * @property {number} [debounceMs] - Debounce time in milliseconds for calculate.
 */
export type UseMathOptions = {
  initialResult?: CalculationResult;
  onValidationComplete?: (result: CalculationResult) => CalculationResult;
  errorMessageMap?: (error: unknown) => string;
  debounceMs?: number;
};

/**
 * Return type of the useMath hook.
 * @property {CalculationResult} state - Current calculation/validation state.
 * @property {(expr: string, scope?: ScopeType) => void} calculate - Debounced async calculation.
 * @property {(expr: string, scope?: ScopeType) => CalculationResult} calculateSync - Synchronous validation.
 * @property {() => void} reset - Reset state to initialResult.
 */
export type UseMathResult = {
  state: CalculationResult;
  calculate: (expr: string, scope?: ScopeType) => void;
  calculateSync: (expr: string, scope?: ScopeType) => CalculationResult;
  reset: () => void;
};

/**
 * React hook for evaluating math expressions with validation and optional debounce.
 * @param {UseMathOptions} options - Configuration options for the hook.
 * @returns {UseMathResult} Hook API for math expression evaluation.
 */
export const useMath = (options: UseMathOptions = {}): UseMathResult => {
  const {
    initialResult = {
      result: null,
      error: null,
      isValid: null,
    },
    onValidationComplete,
    errorMessageMap,
    debounceMs = 0,
  } = options;

  const [state, setState] = useState<CalculationResult>(initialResult);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateSync = useCallback(
    (expr: string, scope?: ScopeType): CalculationResult => {
      try {
        const compiled = compile(expr);
        const res = compiled.evaluate(scope);
        const calculationResult: CalculationResult = {
          result: res,
          error: null,
          isValid: true,
        };
        return typeof onValidationComplete === 'function'
          ? onValidationComplete(calculationResult)
          : calculationResult;
      } catch (err: unknown) {
        const customMsg = errorMessageMap
          ? errorMessageMap(err)
          : err instanceof Error && err.message
            ? err.message
            : 'ValidationError';
        return { result: null, error: customMsg, isValid: false };
      }
    },
    [onValidationComplete, errorMessageMap],
  );

  const calculate = useCallback(
    (expr: string, scope?: ScopeType) => {
      const exec = () => {
        const nextState = calculateSync(expr, scope);
        setState(nextState);
      };
      if (debounceMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(exec, debounceMs);
      } else {
        exec();
      }
    },
    [debounceMs, calculateSync],
  );

  const reset = useCallback(() => {
    setState(initialResult);
  }, [initialResult]);

  return { state, calculate, calculateSync, reset };
};
