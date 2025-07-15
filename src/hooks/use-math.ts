import { compile, MathScope } from 'mathjs';
import { useCallback, useRef, useState } from 'react';

/**
 * Result structure for math expression validation and evaluation.
 */
export type EvaluationResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  error: string | null;
  isValid: boolean | null;
};

/**
 * Options for configuring the useMath hook.
 * @property {EvaluationResult} [initialResult] - Initial state for the hook.
 * @property {(result: EvaluationResult) => EvaluationResult} [onEvaluated] - Callback after evaluation.
 * @property {(error: unknown) => string} [errorMessageMap] - Custom error message mapping.
 * @property {number} [debounceMs] - Debounce time in milliseconds for evaluate.
 */
export type UseMathOptions = {
  initialResult?: EvaluationResult;
  onEvaluated?: (result: EvaluationResult) => EvaluationResult;
  errorMessageMap?: (error: unknown) => string;
  debounceMs?: number;
};

/**
 * Return type of the useMath hook.
 * @property {EvaluationResult} state - Current evaluation/validation state.
 * @property {(expr: string, scope?: ScopeType) => void} evaluate - Debounced async evaluation.
 * @property {(expr: string, scope?: ScopeType) => EvaluationResult} evaluateSync - Synchronous evaluation.
 * @property {() => void} reset - Reset state to initialResult.
 */
export type UseMathResult = {
  state: EvaluationResult;
  evaluate: (expr: string, scope?: MathScope) => void;
  evaluateSync: (expr: string, scope?: MathScope) => EvaluationResult;
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
    onEvaluated,
    errorMessageMap,
    debounceMs = 0,
  } = options;

  const [state, setState] = useState<EvaluationResult>(initialResult);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const evaluateSync = useCallback(
    (expr: string, scope?: MathScope): EvaluationResult => {
      try {
        const compiled = compile(expr);
        const res = compiled.evaluate(scope);
        const evaluationResult: EvaluationResult = {
          result: res,
          error: null,
          isValid: true,
        };
        return typeof onEvaluated === 'function' ? onEvaluated(evaluationResult) : evaluationResult;
      } catch (err: unknown) {
        let customMsg: string;

        if (errorMessageMap) {
          customMsg = errorMessageMap(err);
        } else if (err instanceof Error && err.message) {
          customMsg = err.message;
        } else {
          customMsg = 'ValidationError';
        }

        return { result: null, error: customMsg, isValid: false };
      }
    },
    [onEvaluated, errorMessageMap],
  );

  const evaluate = useCallback(
    (expr: string, scope?: MathScope) => {
      const exec = () => {
        const nextState = evaluateSync(expr, scope);
        setState(nextState);
      };
      if (debounceMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(exec, debounceMs);
      } else {
        exec();
      }
    },
    [debounceMs, evaluateSync],
  );

  const reset = useCallback(() => {
    setState(initialResult);
  }, [initialResult]);

  return { state, evaluate, evaluateSync, reset };
};
