import type { LanguageInterface } from '@/_legacy/interfaces/LanguageInterface';

import type { MutationTree } from 'vuex';
import type { LanguageStateInterface } from '.';

const mutation: MutationTree<LanguageStateInterface> = {
  SET_LANGUAGES(state: LanguageStateInterface, languages: LanguageInterface[]) {
    state.languages = languages;
  },
};

export default mutation;
