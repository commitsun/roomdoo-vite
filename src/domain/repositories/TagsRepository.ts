import type { Tag } from '@/domain/entities/Tag';

export interface TagsRepository {
  fetchTags(): Promise<Tag[]>;
}
