import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useInput from './useInput';

describe('useInput', () => {
  it('memakai nilai awal', () => {
    const { result } = renderHook(() => useInput('halo'));
    expect(result.current[0]).toBe('halo');
  });
  it('menangani event input teks dan checkbox', () => {
    const { result } = renderHook(() => useInput(''));
    act(() => result.current[1]({ target: { type: 'text', value: 'abc' } }));
    expect(result.current[0]).toBe('abc');
    act(() => result.current[1]({ target: { type: 'checkbox', checked: true } }));
    expect(result.current[0]).toBe(true);
  });
  it('menerima nilai langsung dan setter', () => {
    const { result } = renderHook(() => useInput(''));
    act(() => result.current[1]('langsung'));
    expect(result.current[0]).toBe('langsung');
    act(() => result.current[2]('setter'));
    expect(result.current[0]).toBe('setter');
  });
});
