import { describe, it, expect, vi } from 'vitest';
import { InstanceService } from './InstanceService';
import { AppError } from './AppError';
import type { InstanceRepository } from '@/domain/repositories/InstanceRepository';

const mockRepo = (): InstanceRepository => ({
  fetchInstance: vi.fn(),
  fetchLanguages: vi.fn(),
});

describe('InstanceService', () => {
  it('should return instance and languages when both calls succeed', async () => {
    const repo = mockRepo();
    const mockInstance = { name: 'Test Instance' };
    const mockLanguages = [{ id: 'en', name: 'English' }];

    repo.fetchInstance = vi.fn().mockResolvedValue(mockInstance);
    repo.fetchLanguages = vi.fn().mockResolvedValue(mockLanguages);

    const service = new InstanceService(repo);
    const result = await service.fetchInstance();

    expect(result).toEqual({ ...mockInstance, languages: mockLanguages });
  });

  it('should throw INSTANCE_NOT_FOUND if fetchInstance fails with error code 404', async () => {
    const repo = mockRepo();
    repo.fetchInstance = vi.fn().mockRejectedValue(new Error('404'));
    repo.fetchLanguages = vi.fn();

    const service = new InstanceService(repo);

    await expect(service.fetchInstance()).rejects.toThrowError(AppError);
    await expect(service.fetchInstance()).rejects.toMatchObject({ code: 'INSTANCE_NOT_FOUND' });
  });

  it('should throw INSTANCE_NOT_FOUND if fetchInstance fails with error code 500', async () => {
    const repo = mockRepo();
    repo.fetchInstance = vi.fn().mockRejectedValue(new Error('500'));
    repo.fetchLanguages = vi.fn();

    const service = new InstanceService(repo);

    await expect(service.fetchInstance()).rejects.toThrowError(AppError);
    await expect(service.fetchInstance()).rejects.toMatchObject({ code: 'INSTANCE_NOT_FOUND' });
  });

  it('should throw UNKNOWN_ERROR if fetchLanguages fails with error code 500', async () => {
    const repo = mockRepo();
    repo.fetchInstance = vi.fn().mockResolvedValue({ name: 'Test' });
    repo.fetchLanguages = vi.fn().mockRejectedValue(new Error('500'));

    const service = new InstanceService(repo);

    await expect(service.fetchInstance()).rejects.toThrowError(AppError);
    await expect(service.fetchInstance()).rejects.toMatchObject({ code: 'UNKNOWN_ERROR' });
  });
});
