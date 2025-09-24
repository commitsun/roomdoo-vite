import type { PaymentTerm } from '@/domain/entities/PaymentTerm';
import type { PaymentTermRepository } from '@/domain/repositories/PaymentTermRepository';

export class PaymentTermService {
  constructor(private paymentTermsRepository: PaymentTermRepository) {}
  async fetchPaymentTerms(): Promise<PaymentTerm[]> {
    const response = await this.paymentTermsRepository.fetchPaymentTerms();
    return response;
  }
}
