import { type Id } from '@/domain/types/Id';
import { type ImageUrl } from '@/domain/types/ImageUrl';
import type { PmsProperty } from './PmsProperty';

export interface User {
  id: Id;
  email: string;
  firstName: string;
  lastName: string;
  lastName2?: string;
  defaultProperty: PmsProperty;
  phone?: string;
  avatar?: ImageUrl;
  availabilityRuleFields?: string[];
}
