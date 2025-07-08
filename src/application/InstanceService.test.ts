import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mocked } from 'vitest';
import { InstanceService } from './InstanceService';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';
import type { Instance } from '@/domain/entities/Instance';
import type { Language } from '@/domain/entities/Language';

describe('InstanceService', () => {
  const mockInstance: Instance = {
    name: 'Roomdoo Default',
    languages: [],
  };

  const mockLanguages: Language[] = [
    { id: 'lang-en', name: 'English' },
    { id: 'lang-es', name: 'Español' },
  ];

  let instanceRepository: Mocked<InstanceRepository>;
  let service: InstanceService;

  beforeEach(() => {
    instanceRepository = {
      getInstance: vi.fn(),
      getLanguages: vi.fn(),
    };
    service = new InstanceService(instanceRepository);
  });

  it('should return enriched instance with languages', async () => {
    instanceRepository.getInstance.mockResolvedValue(mockInstance);
    instanceRepository.getLanguages.mockResolvedValue(mockLanguages);

    const result = await service.getInstance();

    expect(result).toEqual({
      ...mockInstance,
      languages: mockLanguages,
    });
  });

  it('should return null if getInstance returns null', async () => {
    instanceRepository.getInstance.mockResolvedValue(null);

    const result = await service.getInstance();

    expect(result).toBeNull();
    expect(instanceRepository.getLanguages).not.toHaveBeenCalled();
  });

  it('should throw if getInstance fails', async () => {
    instanceRepository.getInstance.mockRejectedValue(new Error('Instance fetch error'));

    await expect(service.getInstance()).rejects.toThrow('Instance fetch error');
  });

  it('should throw if getLanguages fails', async () => {
    instanceRepository.getInstance.mockResolvedValue(mockInstance);
    instanceRepository.getLanguages.mockRejectedValue(new Error('Languages error'));

    await expect(service.getInstance()).rejects.toThrow('Languages error');
  });
});
