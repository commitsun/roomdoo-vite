import { type Id } from '@/domain/types/Id';
import { type ImageUrl } from '@/domain/types/ImageUrl';

export interface User {
  id: Id;
  email: string;
  firstName: string;
  lastName: string;
  lastName2?: string;
  defaultPropertyId: Id;
  phone?: string;
  avatar?: ImageUrl;
  availabilityRuleFields?: string[];
}
