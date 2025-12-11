import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { z } from 'zod';

import { ContactSchema } from '@/application/contacts/ContactSchemas';

// --- MOCK stdnum ---
vi.mock('stdnum', () => {
  const mk = (fn: (s: string) => boolean) => ({
    validate: (s: string) => ({
      isValid: fn(s),
      compact: s.replace(/\s|-/g, ''),
    }),
  });

  return {
    stdnum: {
      ES: { nif: mk((s) => s === 'NIF-OK') },
      BR: { cpf: mk(() => false) },
      MX: { rfc: mk((s) => s === 'RFC-OK') },
    },
  };
});

const doc = (over: any = {}) => ({
  number: 'X',
  countryCode: 'ES',
  documentTypeName: 'nif',
  documentTypeCode: 'nif',
  isValidableDocument: true,
  ...over,
});

const base = {
  contactType: 'person',
  name: 'John Doe',
  saleChannelId: null,
  documents: [],
};

describe('ContactSchema', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does NOT validate when isValidableDocument=false (skips stdnum)', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({
          number: 'ANYTHING',
          isValidableDocument: false,
        }),
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it('valid document (ES.nif + NIF-OK) passes', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({
          countryCode: 'es',
          documentTypeName: 'NIF',
          documentTypeCode: 'nif',
          number: 'NIF-OK',
        }),
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it('invalid document (BR.cpf always KO) fails', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({
          countryCode: 'BR',
          documentTypeName: 'cpf',
          documentTypeCode: 'cpf',
          number: '123',
        }),
      ],
    });

    expect(parsed.success).toBe(false);
  });

  it('unsupported validator (US.ssn) does NOT block', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({
          countryCode: 'US',
          documentTypeName: 'ssn',
          documentTypeCode: 'ssn',
          number: 'ABC',
        }),
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it('normalizes trim + case before validating', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({
          countryCode: '  es  ',
          documentTypeName: '  NiF ',
          documentTypeCode: ' nif ',
          number: 'NIF-OK',
        }),
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it('two identical documents (same cc/type/number) produce duplicate errors', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({ number: 'ABC', countryCode: 'ES', documentTypeCode: 'dni' }),
        doc({ number: 'ABC', countryCode: 'es', documentTypeCode: 'dni' }),
      ],
    });

    expect(parsed.success).toBe(false);

    const issues = (parsed as any).error.issues as z.ZodIssue[];
    const duplicates = issues.filter((i) => i.message.includes('duplicate'));

    expect(duplicates.length).toBe(2);
  });

  it('agency requires saleChannelId → error', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      contactType: 'agency',
      saleChannelId: null,
    });

    expect(parsed.success).toBe(false);

    const issue = (parsed as any).error.issues.find((i: any) => i.path[0] === 'saleChannelId');

    expect(issue?.message).toBe('contacts.errors.saleChannelRequiredForAgency');
  });

  it('agency with valid saleChannelId passes', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      contactType: 'agency',
      saleChannelId: 7,
    });

    expect(parsed.success).toBe(true);
  });

  it('mixed documents (OK, KO, unsupported) fails because of the KO one', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({
          countryCode: 'ES',
          documentTypeName: 'nif',
          documentTypeCode: 'nif',
          number: 'NIF-OK',
        }),
        doc({
          countryCode: 'BR',
          documentTypeName: 'cpf',
          documentTypeCode: 'cpf',
          number: 'ZZZ',
        }),
        doc({
          countryCode: 'US',
          documentTypeName: 'ssn',
          documentTypeCode: 'ssn',
          number: 'ANY',
        }),
      ],
    });

    expect(parsed.success).toBe(false);
  });
  it('keyOf returns null when documentTypeCode is missing, so documents are not bucketed nor flagged as duplicates', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ documentTypeCode: undefined }), doc({ documentTypeCode: undefined })],
    });
    expect(parsed.success).toBe(true);
  });
  it('skips stdnum when isValidableDocument=false (aunque BR.cpf sea KO en stdnum)', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        {
          ...doc({
            countryCode: 'BR',
            documentTypeName: 'cpf',
            documentTypeCode: 'cpf',
            number: '123',
            isValidableDocument: false,
          }),
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });
  it('keyOf return null when documentTypeCode is missing', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({ documentTypeCode: undefined }),
        doc({ documentTypeCode: undefined, number: 'X-2' }),
      ],
    });

    expect(parsed.success).toBe(true);
  });
});
