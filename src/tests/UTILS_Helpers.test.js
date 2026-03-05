/**
 * Unit tests for utility functions:
 *  - generateInvoiceNumber  (used in RST-01, EXP-01)
 *  - useLocalStorage hook   (used in HD-07)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ── generateInvoiceNumber ──────────────────────────────────────────────────────
describe('generateInvoiceNumber', () => {

    it('should return a string in the format INV-YYYYMMDD-HHMMSS', () => {
        const result = generateInvoiceNumber();
        expect(result).toMatch(/^INV-\d{8}-\d{6}$/);
    });

    it('should produce unique values on successive calls (different seconds)', () => {
        // Freeze time at two different seconds
        const now = Date.now();
        vi.setSystemTime(now);
        const first = generateInvoiceNumber();

        vi.setSystemTime(now + 1000); // +1 second
        const second = generateInvoiceNumber();

        expect(first).not.toBe(second);
    });
});

// ── useLocalStorage ────────────────────────────────────────────────────────────
describe('useLocalStorage', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('HD-07a: should return initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('testKey', 'hello'));
        expect(result.current[0]).toBe('hello');
    });

    it('HD-07b: should persist updated value to localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('shopName', ''));

        act(() => {
            result.current[1]('My Awesome Shop');
        });

        expect(result.current[0]).toBe('My Awesome Shop');
        expect(JSON.parse(localStorage.getItem('shopName'))).toBe('My Awesome Shop');
    });

    it('HD-07c: should read pre-existing value from localStorage on mount (persistence after refresh)', () => {
        localStorage.setItem('shopName', JSON.stringify('Persisted Shop'));
        const { result } = renderHook(() => useLocalStorage('shopName', ''));
        expect(result.current[0]).toBe('Persisted Shop');
    });

    it('HD-07d: should handle corrupted localStorage value gracefully', () => {
        localStorage.setItem('badKey', 'NOT_VALID_JSON{{{');
        const { result } = renderHook(() => useLocalStorage('badKey', 'fallback'));
        expect(result.current[0]).toBe('fallback');
    });
});

