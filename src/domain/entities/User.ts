import { type Id } from '@/domain/types/Id';
import { type ImageUrl } from '@/domain/types/ImageUrl';
import type { PmsProperty } from './PmsProperty';

export interface User {
  id: Id;
  email: string;
  firstName: string;
  lastName: string;
  languageId: Id;
  lastName2?: string;
  defaultPmsProperty: PmsProperty;
  phone?: string;
  avatar?: ImageUrl;
  availabilityRuleFields?: string[];
}
