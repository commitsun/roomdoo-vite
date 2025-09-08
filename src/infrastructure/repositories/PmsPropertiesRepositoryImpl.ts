import type { PmsPropertiesRepository } from '@/domain/repositories/PmsPropertiesRepository';
import { api } from '../http/axios';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { MenuLink } from '@/domain/entities/MenuLink';

export class PmsPropertiesRepositoryImpl implements PmsPropertiesRepository {
  async fetchPmsProperties(): Promise<PmsProperty[]> {
    const response = await api.get<PmsProperty[]>('/pms-properties');
    return response.data;
  }
  async fetchMenuLinks(pmsPropertyId: number): Promise<MenuLink[]> {
    const response = await api.get<MenuLink[]>(`/pms-properties/${pmsPropertyId}/links`);
    return response.data;
  }

  async fetchPmsPropertyLink(pmsPropertyId: number, linkId: number): Promise<string> {
    const response = await api.get<string>(`/pms-properties/${pmsPropertyId}/links/${linkId}`);
    return response.data;
  }
}
