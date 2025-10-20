import type { Id } from '@/domain/types/Id';

export interface MenuLink {
  id: Id;
  label: string;
  isSupportLink: boolean;
}
