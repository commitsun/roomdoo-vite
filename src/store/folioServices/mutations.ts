import type { ServiceInterface } from 'src/interfaces/ServiceInterface';
import type { MutationTree } from 'vuex';
import type { FolioServicesStateInterface } from '.';

const mutation: MutationTree<FolioServicesStateInterface> = {
  SET_FOLIO_SERVICES(state: FolioServicesStateInterface, services: ServiceInterface[]) {
    state.folioServices = services;
  },
};

export default mutation;
