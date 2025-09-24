import type { ImageUrl } from '@/domain/types/ImageUrl';
import type { Id } from '@/domain/types/Id';

export interface PmsProperty {
  id: Id;
  name: string;
  image: ImageUrl;
}

export interface PmsPropertyInfo {
  fields?: string[];
}
