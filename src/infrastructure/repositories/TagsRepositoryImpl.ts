import type { Tag } from '@/domain/entities/Tag';
import type { TagsRepository } from '@/domain/repositories/TagsRepository';
import { api } from '@/infrastructure/http/axios';

export class TagsRepositoryImpl implements TagsRepository {
  async fetchTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>('/contact-tags');
    return response.data;
  }
}
