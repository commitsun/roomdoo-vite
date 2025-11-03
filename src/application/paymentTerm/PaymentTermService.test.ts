import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PaymentTermService } from './PaymentTermService';

import type { PaymentTermRepository } from '@/domain/repositories/PaymentTermRepository';
import type { PaymentTerm } from '@/domain/entities/PaymentTerm';

describe('PaymentTermService.fetchPaymentTerms', () => {
  let service: PaymentTermService;
  let repoMock: Partial<Record<keyof PaymentTermRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchPaymentTerms: vi.fn(),
    };
    service = new PaymentTermService(repoMock as PaymentTermRepository);
  });

  it('returns payment terms from repository', async () => {
    const paymentTerms: PaymentTerm[] = [
      { id: 1, name: 'Net 30' },
      { id: 2, name: 'Net 60' },
    ];
    repoMock.fetchPaymentTerms.mockResolvedValue(paymentTerms);

    const result = await service.fetchPaymentTerms();

    expect(repoMock.fetchPaymentTerms).toHaveBeenCalled();
    expect(result).toBe(paymentTerms);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchPaymentTerms.mockRejectedValue(err);

    await expect(service.fetchPaymentTerms()).rejects.toThrow(err);
  });
});
