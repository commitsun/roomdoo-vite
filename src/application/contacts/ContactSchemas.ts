import { z } from 'zod';
import { isNIF, isNIE } from 'better-dni';

export const ContactSchema = z
  .object({
    contactType: z.enum(['person', 'company', 'agency']),
    name: z.string().trim().min(1, 'contacts.errors.nameRequired'),
    saleChannelId: z.number().int().positive().nullable().optional(),
    documents: z
      .array(
        z
          .object({
            type: z.enum(['dni', 'nie', 'passport', 'other']),
            number: z.string().trim().min(1, 'contacts.errors.documentNumberRequired'),
          })
          .superRefine((doc, ctx) => {
            const n = doc.number.trim().toUpperCase();
            if (doc.type === 'dni' && !isNIF(n)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'contacts.errors.invalidDni',
                path: ['number'],
              });
            }
            if (doc.type === 'nie' && !isNIE(n)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'contacts.errors.invalidNie',
                path: ['number'],
              });
            }
          }),
      )
      .default([]),
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
