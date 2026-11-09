import {
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

/**
 * CONTRACT: 승인된 role을 그대로 Frontend model로 옮긴다.
 * WHY: role 허용 여부는 화면마다 다르므로 adapter가 아니라
 * `AuthProvider.login`의 `expectedRole` 검사가 결정한다.
 */
export function adaptLoginResponseDto(dto: LoginResponseDto): LoginResult {
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
