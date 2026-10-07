import { MemoryAuthSessionStore } from '@/features/auth/authSession';

/**
 * Single document-memory bearer owner shared by AuthProvider and BackendHttpClient.
 * Importing this module must never introduce persistence.
 */
export const authSessionStore = new MemoryAuthSessionStore();
