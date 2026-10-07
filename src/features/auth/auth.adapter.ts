import {
  AuthError,
  type LoginInput,
  type LoginResult,
  type SignupInput,
  type SignupResult,
} from '@/features/auth/authTypes';
import type {
  LoginRequestDto,
  LoginResponseDto,
  SignupRequestDto,
  SignupResponseDto,
} from '@/integrations/backend/contracts';

export function toLoginRequestDto(input: LoginInput): LoginRequestDto {
  return {
    loginId: input.loginId,
    password: input.password,
  };
}

export function toSignupRequestDto(input: SignupInput): SignupRequestDto {
  return {
    loginId: input.loginId,
    password: input.password,
    name: input.name,
    address: input.address,
    contact: input.contact,
  };
}

export function adaptLoginResponseDto(dto: LoginResponseDto): LoginResult {
  if (dto.user.role !== 'CUSTOMER') {
    throw new AuthError('FORBIDDEN');
  }

  return {
    accessToken: dto.accessToken,
    tokenType: dto.tokenType,
    expiresIn: dto.expiresIn,
    user: {
      id: dto.user.id,
      role: dto.user.role,
      name: dto.user.name,
    },
  };
}

export function adaptSignupResponseDto(dto: SignupResponseDto): SignupResult {
  return {
    id: dto.id,
    role: dto.role,
    name: dto.name,
  };
}
