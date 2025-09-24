import type { Tag } from '@/domain/entities/Tag';
import type { TagsRepository } from '@/domain/repositories/TagsRepository';

export class TagsService {
  constructor(private tagsRepository: TagsRepository) {}
  async fetchTags(): Promise<Tag[]> {
    const response = await this.tagsRepository.fetchTags();
    return response;
  }
}
