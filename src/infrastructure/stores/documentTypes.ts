import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { DocumentTypesService } from '@/application/documentTypes/DocumentTypesService';
import { DocumentTypesRepositoryImpl } from '@/infrastructure/repositories/DocumentTypesRepositoryImpl';
import type { DocumentType } from '@/domain/entities/DocumentType';

const documentTypesRepository = new DocumentTypesRepositoryImpl();

export const useDocumentTypesStore = defineStore('documentTypes', () => {
  const documentTypesService = new DocumentTypesService(documentTypesRepository);
  const documentTypes: Ref<DocumentType[]> = ref([]);
  const fetchDocumentTypes = async () => {
    documentTypes.value = await documentTypesService.fetchDocumentTypes();
  };
  const fetchDocumentTypesByCountry = async (countryId: number) => {
    documentTypes.value = await documentTypesService.fetchDocumentTypesByCountry(countryId);
  };
  return {
    documentTypes: readonly(documentTypes),
    fetchDocumentTypes,
    fetchDocumentTypesByCountry,
  };
});
