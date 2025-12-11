import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DocumentTypesService } from './DocumentTypesService';

import type { DocumentTypesRepository } from '@/domain/repositories/DocumentTypesRepository';
import type { DocumentType } from '@/domain/entities/DocumentType';

describe('DocumentTypesService.fetchDocumentTypes', () => {
  let service: DocumentTypesService;
  let repoMock: Partial<Record<keyof DocumentTypesRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchDocumentTypes: vi.fn(),
      fetchFiscalDocumentTypes: vi.fn(),
    };
    service = new DocumentTypesService(repoMock as DocumentTypesRepository);
  });

  it('returns document types from repository', async () => {
    const documentTypes: DocumentType[] = [
      {
        id: 1,
        name: 'DocType1',
        code: 'DT1',
        countries: [{ id: 1, name: 'Country1', code: 'US' }],
        isValidableDocument: true,
        shortCode: 'DT1',
      },
      {
        id: 2,
        name: 'DocType2',
        code: 'DT2',
        countries: [{ id: 2, name: 'Country2', code: 'US' }],
        isValidableDocument: false,
        shortCode: 'DT2',
      },
    ];
    repoMock.fetchDocumentTypes.mockResolvedValue(documentTypes);

    const result = await service.fetchDocumentTypes();

    expect(repoMock.fetchDocumentTypes).toHaveBeenCalled();
    expect(result).toBe(documentTypes);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchDocumentTypes.mockRejectedValue(err);

    await expect(service.fetchDocumentTypes()).rejects.toThrow(err);
  });

  it('returns document types by country from repository', async () => {
    const documentTypes: DocumentType[] = [
      {
        id: 1,
        name: 'DocType1',
        code: 'DT1',
        countries: [{ id: 1, name: 'Country1', code: 'US' }],
        isValidableDocument: true,
        shortCode: 'DT1',
      },
    ];
    repoMock.fetchDocumentTypes.mockResolvedValue(documentTypes);

    const result = await service.fetchDocumentTypesByCountry(1);

    expect(repoMock.fetchDocumentTypes).toHaveBeenCalledWith(1);
    expect(result).toBe(documentTypes);
  });

  it('propagates repository errors for country-specific fetch', async () => {
    const err = new Error('network');
    repoMock.fetchDocumentTypes.mockRejectedValue(err);

    await expect(service.fetchDocumentTypesByCountry(1)).rejects.toThrow(err);
  });
});

describe('DocumentTypesService.fetchFiscalDocumentTypes', () => {
  let service: DocumentTypesService;
  let repoMock: Partial<Record<keyof DocumentTypesRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchDocumentTypes: vi.fn(),
      fetchFiscalDocumentTypes: vi.fn(),
    };
    service = new DocumentTypesService(repoMock as DocumentTypesRepository);
  });

  it('returns fiscal document types from repository', async () => {
    const fiscalDocumentTypes = [
      { id: 1, name: 'FiscalDocType1', code: 'FDT1' },
      { id: 2, name: 'FiscalDocType2', code: 'FDT2' },
    ];
    repoMock.fetchFiscalDocumentTypes.mockResolvedValue(fiscalDocumentTypes);

    const result = await service.fetchFiscalDocumentTypes();

    expect(repoMock.fetchFiscalDocumentTypes).toHaveBeenCalled();
    expect(result).toBe(fiscalDocumentTypes);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchFiscalDocumentTypes.mockRejectedValue(err);

    await expect(service.fetchFiscalDocumentTypes()).rejects.toThrow(err);
  });
});
