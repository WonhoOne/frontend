import { describe, expect, it } from 'vitest';

import { toSafeEmployeeReturnTo } from '@/features/auth/employeeReturnTo';

describe('toSafeEmployeeReturnTo', () => {
  it.each([
    ['/employee/tours', '/employee/tours'],
    ['/employee/tours/12/edit', '/employee/tours/12/edit'],
    ['/employee/inventory', '/employee/inventory'],
    ['/employee/tours?x=1', '/employee/tours?x=1'],
  ])('accepts Employee view path %s', (input, expected) => {
    expect(toSafeEmployeeReturnTo(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    '',
    '/my-trips',
    '/',
    '/employee',
    '/employee/login',
    '/employee/login/',
    '//evil.example/employee/tours',
    '/employee//evil.example',
    'https://evil.example/employee/tours',
    '/employee/\\evil',
    'javascript:alert(1)',
    '/employeeX/tours',
  ])('rejects unsafe or non-Employee target %s', (input) => {
    expect(toSafeEmployeeReturnTo(input)).toBeNull();
  });
});
