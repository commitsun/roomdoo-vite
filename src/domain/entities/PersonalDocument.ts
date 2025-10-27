import type { Country } from './Country';
import type { DocumentType } from './DocumentType';

import type { Id } from '@/domain/types/Id';

export interface PersonalDocument {
  id: Id;
  category: DocumentType;
  name: string;
  country?: Country;
  supportNumber?: string;
}
