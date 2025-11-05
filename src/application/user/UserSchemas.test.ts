import { describe, it, expect } from 'vitest';

import { resetPasswordSchema } from './UserSchemas';

const ok = (data: any) => expect(() => resetPasswordSchema.parse(data)).not.toThrow();
const fail = (data: any) => {
  try {
    resetPasswordSchema.parse(data);
    throw new Error('should fail');
  } catch (e: any) {
    return e;
  }
};

describe('resetPasswordSchema', () => {
  it('accepts valid matching passwords', () => {
    ok({ firstPassword: 'Abcdef12', secondPassword: 'Abcdef12' });
  });

  it('rejects too short', () => {
    const e = fail({ firstPassword: 'Abc12', secondPassword: 'Abc12' });
    const msgs = e.errors?.map((i: any) => i.message) ?? e.issues?.map((i: any) => i.message);
    expect(msgs).toContain('validation.minimumChars:8');
  });

  it('requires a letter', () => {
    const e = fail({ firstPassword: '12345678', secondPassword: '12345678' });
    const msgs = e.issues.map((i: any) => i.message);
    expect(msgs).toContain('validation.passwordLetterRequired');
  });

  it('requires a number', () => {
    const e = fail({ firstPassword: 'Abcdefgh', secondPassword: 'Abcdefgh' });
    const msgs = e.issues.map((i: any) => i.message);
    expect(msgs).toContain('validation.passwordNumberRequired');
  });

  it('secondPassword gets mismatch error', () => {
    const e = fail({ firstPassword: 'Abcdef12', secondPassword: 'Abcdef13' });
    const mismatch = e.issues.find((i: any) => i.message === 'validation.passwordsDontMatch');
    expect(mismatch?.path).toEqual(['secondPassword']);
  });

  it('accumulates multiple issues', () => {
    const e = fail({ firstPassword: 'abcdefg', secondPassword: 'abcdefg' }); // <8 y sin número
    const msgs = e.issues.map((i: any) => i.message);
    expect(msgs).toContain('validation.minimumChars:8');
    expect(msgs).toContain('validation.passwordNumberRequired');
  });
});
