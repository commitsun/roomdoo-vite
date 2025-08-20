import type { MenuLink } from '../entities/MenuLink';
import type { PmsProperty } from '../entities/PmsProperty';

export interface PmsPropertiesRepository {
  fetchPmsProperties(): Promise<PmsProperty[]>;
  fetchMenuLinks(pmsPropertyId: number): Promise<MenuLink[]>;
  fetchPmsPropertyLink(pmsPropertyId: number, linkId: number): Promise<string>;
}
