/**
 * Starts browser mocks only when development explicitly opts in.
 *
 * INVARIANT: Production must never activate MSW from this entrypoint.
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
