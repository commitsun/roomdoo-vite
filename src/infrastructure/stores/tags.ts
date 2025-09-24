import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { TagsService } from '@/application/tags/TagsService';
import { TagsRepositoryImpl } from '@/infrastructure/repositories/TagsRepositoryImpl';
import type { Tag } from '@/domain/entities/Tag';

const tagsRepository = new TagsRepositoryImpl();

export const useTagsStore = defineStore('tags', () => {
  const tagsService = new TagsService(tagsRepository);
  const tags: Ref<Tag[]> = ref([]);
  const fetchTags = async () => {
    tags.value = await tagsService.fetchTags();
  };
  return {
    tags: readonly(tags),
    fetchTags,
  };
});
