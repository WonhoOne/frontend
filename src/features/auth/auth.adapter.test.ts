import { describe, expect, it } from 'vitest';

import {
  adaptLoginResponseDto,
  toLoginRequestDto,
  toSignupRequestDto,
} from '@/features/auth/auth.adapter';

describe('auth adapter', () => {
  it('whitelists Login request fields instead of forwarding the input object', () => {
    const input = {
      loginId: 'customer',
      password: 'input-only',
      customerId: 999,
    };

    expect(toLoginRequestDto(input)).toEqual({
      loginId: 'customer',
      password: 'input-only',
    });
  });

  it('whitelists Signup request fields instead of forwarding future UI-only properties', () => {
    const input = {
      loginId: 'customer',
      password: 'input-only',
      name: 'Customer',
      address: 'Address',
      contact: 'Contact',
      marketingConsent: true,
    };

    expect(toSignupRequestDto(input)).toEqual({
      loginId: 'customer',
      password: 'input-only',
      name: 'Customer',
      address: 'Address',
      contact: 'Contact',
    });
  });

  it('produces a customer-only Frontend login result', () => {
    expect(
      adaptLoginResponseDto({
        accessToken: 'synthetic',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 101,
          role: 'CUSTOMER',
          name: 'Customer',
        },
      }),
    ).toEqual({
      accessToken: 'synthetic',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 101,
        role: 'CUSTOMER',
        name: 'Customer',
      },
    });
  });
});
