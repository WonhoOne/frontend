const EMPLOYEE_AREA_PREFIX = '/employee/';
const EMPLOYEE_LOGIN_PATH = '/employee/login';
const PARSE_BASE = 'https://mister-world.invalid';

/**
 * 직원 로그인 후 돌아갈 경로를 검증한다 (E01 §2).
 *
 * SECURITY: open redirect를 막기 위해 같은 origin의 `/employee/` 하위 view 경로만
 * 허용한다. Customer 경로, 외부 URL, protocol-relative(`//`), backslash, scheme,
 * 로그인 화면 자신은 모두 거부한다. 경로만 저장하며 credential이나 요청 본문은
 * 담지 않는다.
 *
 * WHY: Customer `returnContext`는 ReservationDraft schema에 묶여 있어 직원 화면에
 * 그대로 쓰지 않는다 (CP1-B IA-09).
 */
export function toSafeEmployeeReturnTo(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || !value.startsWith(EMPLOYEE_AREA_PREFIX)) {
    return null;
  }

  if (value.includes('//') || value.includes('\\')) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(value, PARSE_BASE);
  } catch {
    return null;
  }

  if (parsed.origin !== PARSE_BASE || !parsed.pathname.startsWith(EMPLOYEE_AREA_PREFIX)) {
    return null;
  }

  if (parsed.pathname === EMPLOYEE_LOGIN_PATH || parsed.pathname === `${EMPLOYEE_LOGIN_PATH}/`) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}`;
}
