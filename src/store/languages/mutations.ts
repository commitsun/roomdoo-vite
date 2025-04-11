import type { LanguageInterface } from 'src/interfaces/LanguageInterface';

import type { MutationTree } from 'vuex';
import type { LanguageStateInterface } from '.';

const mutation: MutationTree<LanguageStateInterface> = {
  SET_LANGUAGES(state: LanguageStateInterface, languages: LanguageInterface[]) {
    state.languages = languages;
  },
};

export default mutation;
