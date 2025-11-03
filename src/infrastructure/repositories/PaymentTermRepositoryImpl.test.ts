import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PaymentTermRepositoryImpl } from './PaymentTermRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('PaymentTermRepositoryImpl.fetchPaymentTerms', () => {
  let repo: PaymentTermRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PaymentTermRepositoryImpl();
  });
  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchPaymentTerms()).rejects.toThrow(err);
  });
});
