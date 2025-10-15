import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { MenuLink } from '@/domain/entities/MenuLink';

export interface PmsPropertiesRepository {
  fetchPmsProperties(): Promise<PmsProperty[]>;
  fetchMenuLinks(pmsPropertyId: number): Promise<MenuLink[]>;
  fetchPmsPropertyLink(pmsPropertyId: number, linkId: number): Promise<string>;
}
