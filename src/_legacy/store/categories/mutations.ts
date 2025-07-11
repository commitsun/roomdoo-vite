import type { CategoryInterface } from '@/_legacy/interfaces/CategoryInterface';

import type { MutationTree } from 'vuex';
import type { CategoryStateInterface } from '.';

const mutation: MutationTree<CategoryStateInterface> = {
  SET_CATEGORIES(state: CategoryStateInterface, categories: CategoryInterface[]) {
    state.categories = categories;
  },
};

export default mutation;
