import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InstanceService } from './InstanceService';

import { InternalServerError } from '@/application/shared/InternalServerError';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

describe('InstanceService - fetchInstance', () => {
  let instanceService: InstanceService;
  let instanceRepoMock: Partial<Record<keyof InstanceRepository, any>>;

  beforeEach(() => {
    instanceRepoMock = {
      fetchInstance: vi.fn(),
      fetchLanguages: vi.fn(),
    };
    instanceService = new InstanceService(instanceRepoMock as InstanceRepository);
  });

  it('propagate error if fetchInstance or fetchLanguages fails', async () => {
    instanceRepoMock.fetchInstance.mockRejectedValue(new InternalServerError());
    instanceRepoMock.fetchLanguages.mockResolvedValue([]);

    await expect(instanceService.fetchInstance()).rejects.toThrow(InternalServerError);
    expect(instanceRepoMock.fetchInstance).toHaveBeenCalled();
    expect(instanceRepoMock.fetchLanguages).toHaveBeenCalled();
  });

  it('fetch instance and languages, then return merged object (same languages app & instance)', async () => {
    const instanceData = {
      name: 'Roomdoo',
      image: '',
    };
    const languages = [
      { code: 'es-ES', name: 'Español' },
      { code: 'en-US', name: 'English' },
    ];
    instanceRepoMock.fetchInstance.mockResolvedValue(instanceData);
    instanceRepoMock.fetchLanguages.mockResolvedValue(languages);

    const result = await instanceService.fetchInstance();
    expect(instanceRepoMock.fetchInstance).toHaveBeenCalled();
    expect(instanceRepoMock.fetchLanguages).toHaveBeenCalled();
    expect(result).toEqual({
      ...instanceData,
      languages,
    });
  });

  it('fetch instance and languages, then return merged object (1 match 1 not match app languages)', async () => {
    const instanceData = {
      name: 'Roomdoo',
      image: '',
    };
    const languages = [
      { code: 'es-ES', name: 'Español' },
      { code: 'it', name: 'Italiano' },
    ];
    instanceRepoMock.fetchInstance.mockResolvedValue(instanceData);
    instanceRepoMock.fetchLanguages.mockResolvedValue(languages);

    const result = await instanceService.fetchInstance();

    expect(result).toEqual({
      ...instanceData,
      languages: [languages[0]],
    });
  });

  it('fetch instance and languages, then return merged object (1 match 1 not match app languages)', async () => {
    const instanceData = {
      name: 'Roomdoo',
      image: '',
    };
    const languages = [{ code: 'de', name: 'Deutsch' }];
    instanceRepoMock.fetchInstance.mockResolvedValue(instanceData);
    instanceRepoMock.fetchLanguages.mockResolvedValue(languages);
    const result = await instanceService.fetchInstance();

    expect(result).toEqual({
      ...instanceData,
      languages: [{ code: 'en-US', name: 'English' }],
    });
  });
});
