import type { Id } from '@/domain/types/Id';

export interface Country {
  id: Id;
  name: string;
  code: string;
}
