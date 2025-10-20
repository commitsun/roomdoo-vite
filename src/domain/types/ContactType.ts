export const CONTACT_TYPES = ['customer', 'guest', 'agency', 'supplier'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];
