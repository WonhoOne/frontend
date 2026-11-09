import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';

import type { EmployeeLoginNavigationState } from '@/app/router/EmployeeAccessBoundary';
import { employeeRoutePaths } from '@/app/router/paths';
import type { EmployeeSignOutNavigationState } from '@/app/shell/EmployeeShell';
import { AuthError, isEmployeeSession, toSafeEmployeeReturnTo, useAuth } from '@/features/auth';
import styles from '@/pages/employee-login/EmployeeLoginPage.module.css';
import { Button, PageContainer, TextField } from '@/shared/ui';

type FieldErrors = Partial<Record<'loginId' | 'password', string>>;

/** 로그아웃 처리 후 같은 화면을 다시 열 때 남기는 안내 state다. */
interface EmployeeSignedOutNoticeState {
  notice: 'signed-out';
}

function readNavigationState(state: unknown) {
  if (typeof state !== 'object' || state === null) {
    return { signOutRequested: false, sessionExpired: false, signedOut: false };
  }

  return {
    signOutRequested: (state as Partial<EmployeeSignOutNavigationState>).employeeSignOut === true,
    sessionExpired: (state as Partial<EmployeeLoginNavigationState>).reason === 'session-expired',
    signedOut: (state as Partial<EmployeeSignedOutNoticeState>).notice === 'signed-out',
  };
}

function loginErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
    if (error.code === 'LOGIN_FAILED') {
      // SECURITY: 아이디 존재 여부를 드러내지 않는 같은 문구를 쓴다.
      return '아이디 또는 비밀번호가 올바르지 않습니다.';
    }

    if (error.code === 'FORBIDDEN') {
      return '직원 계정이 아닙니다. 직원 계정으로 로그인해 주세요.';
    }

    if (error.code === 'VALIDATION_FAILED') {
      return '입력한 정보를 확인해 주세요.';
    }
  }

  return '로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

/**
 * 직원 로그인 화면이다 (E01).
 *
 * CONTRACT: 공용 `POST /api/v1/auth/login`을 쓰고 EMPLOYEE role만 받아들인다.
 * CUSTOMER 계정으로 인증되면 session을 저장하지 않고 안내만 한다.
 * 공개 직원 가입 경로는 없다 (FR-01).
 */
export function EmployeeLoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = toSafeEmployeeReturnTo(searchParams.get('returnTo'));
  const { signOutRequested, sessionExpired, signedOut } = readNavigationState(location.state);

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const alertRef = useRef<HTMLParagraphElement>(null);

  // LIFECYCLE: shell의 로그아웃은 이 화면으로 이동한 뒤 여기서 session을 비운다
  // (unsaved-changes guard가 이동을 먼저 확인할 수 있게 하기 위함, EmployeeShell 참고).
  useEffect(() => {
    if (!signOutRequested) {
      return;
    }

    auth.signOut();
    const noticeState: EmployeeSignedOutNoticeState = { notice: 'signed-out' };
    void navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: noticeState },
    );
  }, [auth, location.pathname, location.search, navigate, signOutRequested]);

  useEffect(() => {
    if (formError !== null) {
      alertRef.current?.focus();
    }
  }, [formError]);

  if (!signOutRequested && isEmployeeSession(auth.state)) {
    return <Navigate replace to={returnTo ?? employeeRoutePaths.tours} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors: FieldErrors = {};

    if (loginId.trim().length === 0) {
      nextErrors.loginId = '아이디를 입력해 주세요.';
    }

    if (password.length === 0) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    }

    setFieldErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await auth.login({ loginId, password }, { expectedRole: 'EMPLOYEE' });
      void navigate(returnTo ?? employeeRoutePaths.tours, { replace: true });
    } catch (error) {
      if (error instanceof AuthError && error.code === 'LOGIN_FAILED') {
        setPassword('');
      }

      setFormError(loginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const notice = signedOut
    ? '로그아웃했습니다.'
    : sessionExpired
      ? '세션이 만료되어 다시 로그인해야 합니다.'
      : null;

  return (
    <PageContainer variant="auth">
      <section aria-labelledby="employee-login-heading" className={styles.card}>
        <header className={styles.header}>
          <p className={styles.brand}>
            <span className={styles.wordmark}>Mister World</span>
            <span className={styles.context}>직원</span>
          </p>
          <h1 className={styles.title} id="employee-login-heading">
            직원 로그인
          </h1>
        </header>

        <div aria-live="polite" role="status">
          {notice === null ? null : <p className={styles.notice}>{notice}</p>}
        </div>

        {formError === null ? null : (
          <p className={styles.alert} ref={alertRef} role="alert" tabIndex={-1}>
            {formError}
          </p>
        )}

        <form className={styles.form} noValidate onSubmit={(event) => void handleSubmit(event)}>
          <TextField
            autoComplete="username"
            {...(fieldErrors.loginId === undefined ? {} : { error: fieldErrors.loginId })}
            label="아이디"
            name="loginId"
            onChange={(event) => setLoginId(event.target.value)}
            readOnly={isSubmitting}
            required
            value={loginId}
          />
          <TextField
            autoComplete="current-password"
            {...(fieldErrors.password === undefined ? {} : { error: fieldErrors.password })}
            label="비밀번호"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            readOnly={isSubmitting}
            required
            type="password"
            value={password}
          />
          <Button isLoading={isSubmitting} loadingLabel="로그인 중" size="large" type="submit">
            로그인
          </Button>
        </form>

        <p className={styles.help}>직원 계정은 관리자가 발급합니다.</p>
      </section>
    </PageContainer>
  );
}
