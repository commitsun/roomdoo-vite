import type { Language } from './Language';

import type { ImageUrl } from '@/domain/types/ImageUrl';
type DynamicField = {
  field: string;
  source: string;
};
export interface Instance {
  name: string;
  languages: Language[];
  dynamicFields: DynamicField[];
  image?: ImageUrl;
}
