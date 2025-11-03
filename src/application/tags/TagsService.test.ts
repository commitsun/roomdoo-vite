import { describe, it, expect, vi, beforeEach } from 'vitest';

import { TagsService } from './TagsService';

import type { TagsRepository } from '@/domain/repositories/TagsRepository';
import type { Tag } from '@/domain/entities/Tag';

describe('TagsService.fetchTags', () => {
  let service: TagsService;
  let repoMock: Partial<Record<keyof TagsRepository, any>>;

  beforeEach(() => {
    repoMock = {
      fetchTags: vi.fn(),
    };
    service = new TagsService(repoMock as TagsRepository);
  });

  it('returns tags from repository', async () => {
    const tags: Tag[] = [
      { id: 1, name: 'Tag1' },
      { id: 2, name: 'Tag2' },
    ];
    repoMock.fetchTags.mockResolvedValue(tags);

    const result = await service.fetchTags();

    expect(repoMock.fetchTags).toHaveBeenCalled();
    expect(result).toBe(tags);
  });

  it('propagates repository errors', async () => {
    const err = new Error('network');
    repoMock.fetchTags.mockRejectedValue(err);

    await expect(service.fetchTags()).rejects.toThrow(err);
  });
});
