import { z } from 'zod';
import { stdnum } from 'stdnum';

type StdnumValidator = { validate: (s: string) => { isValid: boolean; compact?: string } };
type StdnumModule = Record<string, Record<string, StdnumValidator | undefined> | undefined>;
const S = stdnum as unknown as StdnumModule;

const DocumentInputSchema = z
  .object({
    number: z.string().trim().min(1, 'contacts.errors.documentNumberRequired'),
    countryCode: z.string().trim().length(2, 'contacts.errors.countryRequired'),
    documentTypeName: z.string().trim().min(1, 'contacts.errors.documentTypeRequired'),
    isValidable: z.boolean().default(false),
  })
  .superRefine((doc, ctx) => {
    if (!doc.isValidable) {
      return;
    }

    const cc = (doc.countryCode ?? '').trim().toUpperCase();
    const dn = (doc.documentTypeName ?? '').trim().toLowerCase();

    const validator = S[cc]?.[dn];
    if (validator && typeof validator.validate === 'function') {
      const { isValid } = validator.validate(doc.number ?? '');
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'contacts.errors.invalidDocument',
          path: ['number'],
        });
      }
    }
  });

export const ContactSchema = z
  .object({
    contactType: z.enum(['person', 'company', 'agency']),
    name: z.string().trim().min(1, 'contacts.errors.nameRequired'),
    saleChannelId: z.number().int().positive().nullable().optional(),
    documents: z.array(DocumentInputSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.contactType === 'agency' && (data.saleChannelId ?? null) === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'contacts.errors.saleChannelRequiredForAgency',
        path: ['saleChannelId'],
      });
    }
  });

export type ContactInput = z.infer<typeof ContactSchema>;
