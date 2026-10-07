import {
  expectEnum,
  expectPositiveInteger,
  expectRecord,
  expectString,
} from '@/integrations/backend/contracts/decoder';

export const userRoles = ['CUSTOMER', 'EMPLOYEE'] as const;
export type UserRoleDto = (typeof userRoles)[number];

export interface AuthUserDto {
  id: number;
  role: UserRoleDto;
  name: string;
}

export interface LoginRequestDto {
  loginId: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUserDto;
}

export interface SignupRequestDto {
  loginId: string;
  password: string;
  name: string;
  address: string;
  contact: string;
}

export interface SignupResponseDto {
  id: number;
  role: 'CUSTOMER';
  name: string;
}

function decodeAuthUser(value: unknown, path: string): AuthUserDto {
  const contract = 'AuthLoginResponse' as const;
  const record = expectRecord(value, contract, path);

  return {
    id: expectPositiveInteger(record.id, contract, path + '.id'),
    role: expectEnum(record.role, userRoles, contract, path + '.role'),
    name: expectString(record.name, contract, path + '.name'),
  };
}

export function decodeLoginResponseDto(value: unknown): LoginResponseDto {
  const contract = 'AuthLoginResponse' as const;
  const record = expectRecord(value, contract, '$');

  return {
    accessToken: expectString(record.accessToken, contract, '$.accessToken'),
    tokenType: expectEnum(record.tokenType, ['Bearer'] as const, contract, '$.tokenType'),
    expiresIn: expectPositiveInteger(record.expiresIn, contract, '$.expiresIn'),
    user: decodeAuthUser(record.user, '$.user'),
  };
}

export function decodeSignupResponseDto(value: unknown): SignupResponseDto {
  const contract = 'AuthSignupResponse' as const;
  const record = expectRecord(value, contract, '$');

  return {
    id: expectPositiveInteger(record.id, contract, '$.id'),
    role: expectEnum(record.role, ['CUSTOMER'] as const, contract, '$.role'),
    name: expectString(record.name, contract, '$.name'),
  };
}
