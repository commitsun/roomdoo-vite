import type { DocumentType } from '@/domain/entities/DocumentType';
import type { FiscalDocumentType } from '@/domain/entities/FiscalDocumentType';

export interface DocumentTypesRepository {
  fetchDocumentTypes(countryId?: number): Promise<DocumentType[]>;
  fetchFiscalDocumentTypes(): Promise<FiscalDocumentType[]>;
}
