import type { DocumentType } from '@/domain/entities/DocumentType';
import type { DocumentTypesRepository } from '@/domain/repositories/DocumentTypesRepository';
import { api } from '@/infrastructure/http/axios';

export class DocumentTypesRepositoryImpl implements DocumentTypesRepository {
  async fetchDocumentTypes(countryId?: number): Promise<DocumentType[]> {
    const response = await api.get<DocumentType[]>('/id-number-categories', {
      params: countryId ? { country: countryId } : {},
    });
    return response.data;
  }
}
