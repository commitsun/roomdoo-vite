import type { PmsPropertiesRepository } from '@/domain/repositories/PmsPropertiesRepository';
import { api } from '../http/axios';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { MenuLink } from '@/domain/entities/MenuLink';

export class PmsPropertiesRepositoryImpl implements PmsPropertiesRepository {
  async fetchPmsProperties(): Promise<PmsProperty[]> {
    return api.get('/pms-properties').then((response) => response.data);
  }
  async fetchMenuLinks(pmsPropertyId: number): Promise<MenuLink[]> {
    return api.get(`/pms-properties/${pmsPropertyId}/links`).then((response) => response.data);
  }

  async fetchPmsPropertyLink(pmsPropertyId: number, linkId: number): Promise<string> {
    return api
      .get(`/pms-properties/${pmsPropertyId}/links/${linkId}`)
      .then((response) => response.data);
  }
}
