import type { DocumentType } from '@/domain/entities/DocumentType';
import type { FiscalDocumentType } from '@/domain/entities/FiscalDocumentType';
import type { DocumentTypesRepository } from '@/domain/repositories/DocumentTypesRepository';

export class DocumentTypesService {
  constructor(private documentTypesRepository: DocumentTypesRepository) {}
  async fetchDocumentTypes(): Promise<DocumentType[]> {
    const response = await this.documentTypesRepository.fetchDocumentTypes();
    return response;
  }
  async fetchDocumentTypesByCountry(countryId: number): Promise<DocumentType[]> {
    const response = await this.documentTypesRepository.fetchDocumentTypes(countryId);
    return response;
  }
  async fetchFiscalDocumentTypes(): Promise<FiscalDocumentType[]> {
    const response = await this.documentTypesRepository.fetchFiscalDocumentTypes();
    return response;
  }
}
