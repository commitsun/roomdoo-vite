import type { SaleChannelInterface } from '@/interfaces/SaleChannelnterface';
import type { MutationTree } from 'vuex';
import type { SaleChannelsStateInterface } from '.';

const mutation: MutationTree<SaleChannelsStateInterface> = {
  SET_SALE_CHANNELS(state: SaleChannelsStateInterface, saleChannels: SaleChannelInterface[]) {
    state.saleChannels = saleChannels;
  },
};

export default mutation;
