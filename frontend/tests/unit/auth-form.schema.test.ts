import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  authSchema,
  loginSchema,
  registerSchema,
} from '../../src/features/auth/schemas/auth.schema';

describe('auth schema validation', () => {
  it('accepts valid login credentials', () => {
    const result = v.safeParse(loginSchema, {
      email: 'lider@abasto.org',
      password: 'Password123',
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid registration payload', () => {
    const result = v.safeParse(registerSchema, {
      fullName: 'Ana García',
      email: 'ana@abasto.org',
      password: 'Password123',
      role: 'leader_disaster',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const result = v.safeParse(authSchema, {
      fullName: 'A',
      email: 'not-an-email',
      password: 'short',
      role: 'leader_disaster',
    });

    expect(result.success).toBe(false);
  });
});
