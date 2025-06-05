import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useMath } from './use-math';

describe('useMath', () => {
  describe('calculate', () => {
    it('calculate a valid expression', () => {
      const { result } = renderHook(() => useMath());

      act(() => {
        result.current.calculate('2 + 3', undefined);
      });

      expect(result.current.state.result).toBe(5);
      expect(result.current.state.error).toBeNull();
    });

    it('detects invalid expression', () => {
      const { result } = renderHook(() => useMath());

      act(() => {
        result.current.calculate('2 + ');
      });

      expect(result.current.state.result).toBeNull();
      expect(result.current.state.error).toBeTruthy();
    });
  });

  describe('validateSync', () => {
    it('returns correct result for valid expression', () => {
      const { result } = renderHook(() => useMath());
      const res = result.current.calculateSync('4 * 5');
      expect(res.result).toBe(20);
      expect(res.error).toBeNull();
      expect(res.isValid).toBe(true);
    });

    it('returns error for invalid expression', () => {
      const { result } = renderHook(() => useMath());
      const res = result.current.calculateSync('4 *');
      expect(res.result).toBeNull();
      expect(res.error).toBeTruthy();
      expect(res.isValid).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets state to initialResult', () => {
      const initialResult = { result: 42, error: null, isValid: true };
      const { result } = renderHook(() => useMath({ initialResult }));

      act(() => {
        result.current.calculate('1 + 1');
      });
      expect(result.current.state.result).toBe(2);

      act(() => {
        result.current.reset();
      });
      expect(result.current.state).toEqual(initialResult);
    });
  });
});
