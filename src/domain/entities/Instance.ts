import type { Language } from './Language';

import type { ImageUrl } from '@/domain/types/ImageUrl';

export interface Instance {
  name: string;
  languages: Language[];
  image?: ImageUrl;
}
