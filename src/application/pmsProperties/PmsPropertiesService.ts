import type { MenuLink } from '@/domain/entities/MenuLink';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { PmsPropertiesRepository } from '@/domain/repositories/PmsPropertiesRepository';

export class PmsPropertiesService {
  constructor(private pmsPropertiesRepository: PmsPropertiesRepository) {}
  fetchPmsProperties(): Promise<PmsProperty[]> {
    return this.pmsPropertiesRepository.fetchPmsProperties();
  }
  fetchMenuLinks(pmsPropertyId: number): Promise<MenuLink[]> {
    return this.pmsPropertiesRepository.fetchMenuLinks(pmsPropertyId);
  }
  fetchPmsPropertyLink(pmsPropertyId: number, linkId: number): Promise<string> {
    return this.pmsPropertiesRepository.fetchPmsPropertyLink(pmsPropertyId, linkId);
  }
}
