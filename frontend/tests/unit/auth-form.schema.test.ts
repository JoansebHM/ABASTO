import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  authSchema,
  loginSchema,
  registerSchema,
} from '../../src/features/auth/schemas/auth.schema';
import { valibotResolver } from '../../src/lib/valibotResolver';

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

  it('returns validated values through the login form resolver', async () => {
    const result = await valibotResolver(loginSchema)({
      email: 'lider@abasto.org',
      password: 'Password123',
    }, {} as never, {} as never);

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({
      email: 'lider@abasto.org',
      password: 'Password123',
    });
  });

  it('maps registration schema issues to field errors in the resolver', async () => {
    const result = await valibotResolver(registerSchema)({
      fullName: 'A',
      email: 'not-an-email',
      password: 'short',
      role: 'leader_disaster',
    }, {} as never, {} as never);

    expect(result.values).toEqual({});
    expect(result.errors).toEqual(
      expect.objectContaining({
        fullName: expect.objectContaining({ type: expect.any(String) }),
        email: expect.objectContaining({ type: expect.any(String) }),
        password: expect.objectContaining({ type: expect.any(String) }),
      })
    );
  });
});
