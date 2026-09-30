/**
 * Development에서 명시적으로 opt-in한 경우에만 browser mock을 시작한다.
 *
 * INVARIANT: Production에서는 이 entrypoint를 통해 MSW가 활성화되면 안 된다.
 */
export async function startMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}
