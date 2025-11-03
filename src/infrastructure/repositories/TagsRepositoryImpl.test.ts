import { describe, it, expect, vi, beforeEach } from 'vitest';

import { TagsRepositoryImpl } from './TagsRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

describe('TagsRepositoryImpl.fetchTags', () => {
  let repo: TagsRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new TagsRepositoryImpl();
  });

  it('returns tags from the API', async () => {
    const tags = [
      { id: 1, name: 'Tag 1' },
      { id: 2, name: 'Tag 2' },
    ];
    (api.get as any).mockResolvedValue({ data: tags });

    const result = await repo.fetchTags();

    expect(result).toEqual(tags);
  });

  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchTags()).rejects.toThrow(err);
  });
});
