import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import { routePaths } from '@/app/router/paths';
import { AuthError, useAuth } from '@/features/auth';
import { Button, PageContainer, TextField, TextLink } from '@/shared/ui';

import styles from '@/pages/login/LoginPage.module.css';

function getLoginErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
    if (error.code === 'LOGIN_FAILED') {
      return '입력한 로그인 정보를 확인해주세요.';
    }

    if (error.code === 'VALIDATION_FAILED') {
      return '입력한 정보를 확인하고 다시 시도해주세요.';
    }
  }

  return '잠시 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export function LoginPage() {
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit = loginId.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await login({ loginId, password });
      // E05 owns ReturnContext recovery. Until then, direct Login uses only the
      // contract-safe home fallback and never invents transaction restoration.
      void navigate(routePaths.home, { replace: true });
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <PageContainer variant="auth">
        <section aria-labelledby="login-heading" className={styles.surface}>
          <header className={styles.header}>
            <p className={styles.brand}>Mister World</p>
            <p className={styles.eyebrow}>Account</p>
            <h1 id="login-heading">Welcome back</h1>
            <p className={styles.supportingCopy}>
              로그인하고 여행 준비를 이어가세요.
            </p>
          </header>

          {state.status === 'checking' ? (
            <p aria-live="polite" className={styles.status}>
              로그인 상태를 확인하고 있습니다.
            </p>
          ) : (
            <form className={styles.form} noValidate onSubmit={handleSubmit}>
              <TextField
                autoComplete="username"
                disabled={isSubmitting}
                label="로그인 ID"
                name="loginId"
                onChange={(event) => setLoginId(event.target.value)}
                required
                value={loginId}
              />
              <TextField
                autoComplete="current-password"
                disabled={isSubmitting}
                label="비밀번호"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />

              <div aria-atomic="true" aria-live="polite" className={styles.errorRegion}>
                {formError === null ? null : <p role="alert">{formError}</p>}
              </div>

              <Button
                className={styles.submit}
                disabled={!canSubmit}
                isLoading={isSubmitting}
                loadingLabel="로그인 중"
                size="large"
                type="submit"
              >
                로그인
              </Button>
            </form>
          )}

          <p className={styles.signup}>
            처음이신가요? <TextLink to={routePaths.signup}>회원가입</TextLink>
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
