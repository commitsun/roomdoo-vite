import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstanceService } from './InstanceService';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';
import { InternalServerError } from '../shared/InternalServerError';

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

  it('should fetch instance and languages, then return merged object', async () => {
    // Arrange
    const instanceData = {
      name: 'Roomdoo',
      image: '',
    };
    const languages = [
      { id: 1, code: 'es', name: 'Español' },
      { id: 2, code: 'en', name: 'English' },
    ];
    instanceRepoMock.fetchInstance.mockResolvedValue(instanceData);
    instanceRepoMock.fetchLanguages.mockResolvedValue(languages);

    // Act
    const result = await instanceService.fetchInstance();

    // Assert
    expect(instanceRepoMock.fetchInstance).toHaveBeenCalled();
    expect(instanceRepoMock.fetchLanguages).toHaveBeenCalled();
    expect(result).toEqual({
      ...instanceData,
      languages,
    });
  });

  it('should propagate error if fetchInstance or fetchLanguages fails', async () => {
    instanceRepoMock.fetchInstance.mockRejectedValue(new InternalServerError());
    instanceRepoMock.fetchLanguages.mockResolvedValue([]);

    await expect(instanceService.fetchInstance()).rejects.toThrow(InternalServerError);
    expect(instanceRepoMock.fetchInstance).toHaveBeenCalled();
    expect(instanceRepoMock.fetchLanguages).toHaveBeenCalled();
  });
});
