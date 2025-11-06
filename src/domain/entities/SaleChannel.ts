import type { Id } from '@/domain/types/Id';

export interface SaleChannel {
  id: Id;
  name: string;
  type: 'direct' | 'indirect';
}
