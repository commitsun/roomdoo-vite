import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { DocumentTypesService } from '@/application/documentTypes/DocumentTypesService';
import { DocumentTypesRepositoryImpl } from '@/infrastructure/repositories/DocumentTypesRepositoryImpl';
import type { DocumentType } from '@/domain/entities/DocumentType';
import type { FiscalDocumentType } from '@/domain/entities/FiscalDocumentType';

const documentTypesRepository = new DocumentTypesRepositoryImpl();

export const useDocumentTypesStore = defineStore('documentTypes', () => {
  const documentTypesService = new DocumentTypesService(documentTypesRepository);
  const documentTypes: Ref<DocumentType[]> = ref([]);
  const fiscalDocumentTypes: Ref<FiscalDocumentType[]> = ref([]);
  const fetchDocumentTypes = async (): Promise<void> => {
    documentTypes.value = await documentTypesService.fetchDocumentTypes();
  };
  const fetchDocumentTypesByCountry = async (countryId: number): Promise<void> => {
    await documentTypesService.fetchDocumentTypesByCountry(countryId);
  };
  const fetchFiscalDocumentTypes = async (): Promise<void> => {
    fiscalDocumentTypes.value = await documentTypesService.fetchFiscalDocumentTypes();
  };
  return {
    documentTypes: readonly(documentTypes),
    fiscalDocumentTypes: readonly(fiscalDocumentTypes),
    fetchDocumentTypes,
    fetchDocumentTypesByCountry,
    fetchFiscalDocumentTypes,
  };
});
