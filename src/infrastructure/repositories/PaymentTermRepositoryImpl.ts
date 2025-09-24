import type { PaymentTerm } from '@/domain/entities/PaymentTerm';
import type { PaymentTermRepository } from '@/domain/repositories/PaymentTermRepository';
import { api } from '@/infrastructure/http/axios';

export class PaymentTermRepositoryImpl implements PaymentTermRepository {
  async fetchPaymentTerms(): Promise<PaymentTerm[]> {
    return api.get('/payment-terms').then((response) => response.data);
  }
}
