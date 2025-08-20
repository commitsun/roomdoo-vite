import type { PmsPropertiesRepository } from '@/domain/repositories/PmsPropertiesRepository';
import { api } from '../http/axios';
import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { MenuLink } from '@/domain/entities/MenuLink';

export class PmsPropertiesRepositoryImpl implements PmsPropertiesRepository {
  async fetchPmsProperties(): Promise<PmsProperty[]> {
    const response = await api.get<PmsProperty[]>('/properties');
    return response.data;
  }
  async fetchMenuLinks(pmsPropertyId: number): Promise<MenuLink[]> {
    const response = await api.get<
      Array<Omit<MenuLink, 'isSupportLink'> & { support_link: boolean }>
    >(`/properties/${pmsPropertyId}/links`);

    return response.data.map((link) => ({
      ...link,
      isSupportLink: link.support_link,
    }));
  }
  async fetchPmsPropertyLink(pmsPropertyId: number, linkId: number): Promise<string> {
    const response = await api.get<string>(`/properties/${pmsPropertyId}/links/${linkId}`);
    return response.data;
  }
}
