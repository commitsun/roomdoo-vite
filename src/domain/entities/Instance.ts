import type { ImageUrl } from '../types/ImageUrl';
import type { Language } from './Language';

export interface Instance {
  name: string;
  languages: Language[];
  image?: ImageUrl;
}
