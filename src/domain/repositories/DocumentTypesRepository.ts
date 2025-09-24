import type { DocumentType } from '@/domain/entities/DocumentType';

export interface DocumentTypesRepository {
  fetchDocumentTypes(countryId?: number): Promise<DocumentType[]>;
}
