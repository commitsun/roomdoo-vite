import type { Id } from '../types/Id';
import type { ImageUrl } from '../types/ImageUrl';

export interface PmsProperty {
  id: Id;
  name: string;
  image: ImageUrl;
}
