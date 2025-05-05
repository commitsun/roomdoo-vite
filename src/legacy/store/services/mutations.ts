import type { ServiceInterface } from '@/legacy/interfaces/ServiceInterface';
import type { MutationTree } from 'vuex';
import type { ServiceStateInterface } from '.';

const mutation: MutationTree<ServiceStateInterface> = {
  SET_SERVICES(state: ServiceStateInterface, services: ServiceInterface[]) {
    state.services = services;
  },
  CLEAR_FOLIO_SERVICES(state) {
    state.folioServices = [];
  },
  ADD_FOLIO_SERVICES(state: ServiceStateInterface, services: ServiceInterface[]) {
    services.forEach((s) => {
      s.serviceLines.forEach((l) => {
        l.date = new Date(l.date);
      });
      state.folioServices.push(s);
    });
  },
};

export default mutation;
