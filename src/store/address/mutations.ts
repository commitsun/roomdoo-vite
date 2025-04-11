import type { AddressInterface } from '@/interfaces/AddressInterface';
import type { MutationTree } from 'vuex';
import type { AddressStateInterface } from '.';

const mutation: MutationTree<AddressStateInterface> = {
  SET_ADDRESS(state: AddressStateInterface, address: AddressInterface) {
    state.address = address;
  },

  SET_ADDRESSES(state: AddressStateInterface, addresses: AddressInterface[]) {
    state.addresess = addresses;
  },

  REMOVE_ADDRESSES(state: AddressStateInterface) {
    state.addresess = [];
  },

  REMOVE_ADDRESS(state: AddressStateInterface) {
    state.address = null;
  },
};

export default mutation;
