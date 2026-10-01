import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { routePaths } from '@/app/router/paths';
import { AuthError, useAuth } from '@/features/auth';
import { Button, PageContainer, TextField, TextLink } from '@/shared/ui';

import styles from '@/pages/signup/SignupPage.module.css';

function getSignupErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
    if (error.code === 'LOGIN_ID_ALREADY_EXISTS') {
      return '이미 사용 중인 로그인 ID입니다. 다른 ID를 입력하거나 로그인해주세요.';
    }

    if (error.code === 'VALIDATION_FAILED') {
      return '입력한 정보를 확인하고 다시 시도해주세요.';
    }
  }

  return '회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.';
}

export function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit =
    loginId.trim().length > 0 &&
    password.length > 0 &&
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    contact.trim().length > 0 &&
    !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await auth.signup({ loginId, password, name, address, contact });
      // v0.2 signup creates a CUSTOMER but deliberately does not authenticate.
      // E05 owns ReturnContext recovery; signup therefore continues to Login.
      void navigate(routePaths.login, { replace: true });
    } catch (error) {
      setFormError(getSignupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageContainer variant="auth">
        <section aria-labelledby="signup-heading" className={styles.surface}>
          <header className={styles.header}>
            <p className={styles.brand}>Mister World</p>
            <p className={styles.eyebrow}>Account</p>
            <h1 id="signup-heading">Signup</h1>
            <p className={styles.supportingCopy}>여행을 이어갈 고객 계정을 만들어보세요.</p>
          </header>

          <form className={styles.form} noValidate onSubmit={(event) => void handleSubmit(event)}>
            <fieldset className={styles.fieldset} disabled={isSubmitting}>
              <legend>계정 정보</legend>
              <TextField
                autoComplete="username"
                label="로그인 ID"
                name="loginId"
                onChange={(event) => setLoginId(event.target.value)}
                required
                value={loginId}
              />
              <TextField
                autoComplete="new-password"
                label="비밀번호"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </fieldset>

            <fieldset className={styles.fieldset} disabled={isSubmitting}>
              <legend>고객 정보</legend>
              <TextField
                autoComplete="name"
                label="성명"
                name="name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
              <TextField
                autoComplete="street-address"
                label="주소"
                name="address"
                onChange={(event) => setAddress(event.target.value)}
                required
                value={address}
              />
              <TextField
                autoComplete="tel"
                inputMode="tel"
                label="연락처"
                name="contact"
                onChange={(event) => setContact(event.target.value)}
                required
                value={contact}
              />
            </fieldset>

            <div aria-atomic="true" aria-live="polite" className={styles.errorRegion}>
              {formError === null ? null : <p role="alert">{formError}</p>}
            </div>

            <Button
              className={styles.submit}
              disabled={!canSubmit}
              isLoading={isSubmitting}
              loadingLabel="계정 만드는 중"
              size="large"
              type="submit"
            >
              회원가입
            </Button>
          </form>

          <p className={styles.login}>
            이미 계정이 있나요? <TextLink to={routePaths.login}>로그인</TextLink>
          </p>
        </section>
      </PageContainer>
    </div>
  );
}
