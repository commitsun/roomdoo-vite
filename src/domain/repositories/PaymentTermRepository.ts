import type { PaymentTerm } from '@/domain/entities/PaymentTerm';

export interface PaymentTermRepository {
  fetchPaymentTerms(): Promise<PaymentTerm[]>;
}
