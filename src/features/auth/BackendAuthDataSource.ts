import type { AuthDataSource } from '@/features/auth/AuthDataSource';
import {
  adaptLoginResponseDto,
  adaptSignupResponseDto,
  toLoginRequestDto,
  toSignupRequestDto,
} from '@/features/auth/auth.adapter';
import { mapBackendAuthFailure } from '@/features/auth/backendAuthError';
import type { LoginInput, SignupInput } from '@/features/auth/authTypes';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import {
  decodeLoginResponseDto,
  decodeSignupResponseDto,
} from '@/integrations/backend/contracts';

export class BackendAuthDataSource implements AuthDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async login(input: LoginInput) {
    try {
      const response = await this.client.requestJson({
        path: '/auth/login',
        method: 'POST',
        body: toLoginRequestDto(input),
      });

      return adaptLoginResponseDto(decodeLoginResponseDto(response.body));
    } catch (error) {
      throw mapBackendAuthFailure(error);
    }
  }

  async signup(input: SignupInput) {
    try {
      const response = await this.client.requestJson({
        path: '/auth/signup',
        method: 'POST',
        body: toSignupRequestDto(input),
      });

      return adaptSignupResponseDto(decodeSignupResponseDto(response.body));
    } catch (error) {
      throw mapBackendAuthFailure(error);
    }
  }
}
