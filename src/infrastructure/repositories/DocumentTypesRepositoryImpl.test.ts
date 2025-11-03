import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DocumentTypesRepositoryImpl } from './DocumentTypesRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';
import type { DocumentType } from '@/domain/entities/DocumentType';

describe('DocumentTypesRepositoryImpl.fetchDocumentTypes', () => {
  let repo: DocumentTypesRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new DocumentTypesRepositoryImpl();
  });

  it('returns document types without country param and data on success', async () => {
    const data: DocumentType[] = [];
    vi.mocked(api.get).mockResolvedValue({ data });

    const result = await repo.fetchDocumentTypes();

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);

    const [[url, config]] = vi.mocked(api.get).mock.calls;
    expect(url).toBe('/id-number-categories');
    expect(config).toEqual(
      expect.objectContaining({
        params: { country: undefined },
      }),
    );

    expect(result).toBe(data);
  });

  it('passes country as query param when provided', async () => {
    const data: DocumentType[] = [];
    vi.mocked(api.get).mockResolvedValue({ data });

    const result = await repo.fetchDocumentTypes(34);

    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/id-number-categories', {
      params: { country: 34 },
    });
    expect(result).toBe(data);
  });

  it('propagates axios errors for fiscal document types', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchDocumentTypes()).rejects.toThrow(err);
  });

  it('returns fiscal document types on success', async () => {
    const data: DocumentType[] = [];
    vi.mocked(api.get).mockResolvedValue({ data });

    const result = await repo.fetchFiscalDocumentTypes();

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/contact-fiscal-document');
    expect(result).toBe(data);
  });
  it('propagates axios errors for fiscal document types', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchFiscalDocumentTypes()).rejects.toThrow(err);
  });
});
