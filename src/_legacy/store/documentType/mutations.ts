import type { DocumentTypeInterface } from '@/_legacy/interfaces/DocumentTypeInterface';

import type { MutationTree } from 'vuex';
import type { DocumentTypeStateInterface } from '.';

const mutation: MutationTree<DocumentTypeStateInterface> = {
  SET_DOCUMENT_TYPES(state: DocumentTypeStateInterface, documentType: DocumentTypeInterface[]) {
    state.documentType = documentType;
  },
};

export default mutation;
