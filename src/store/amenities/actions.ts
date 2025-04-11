import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { AmenityInterface } from '@/interfaces/AmenityInterface';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { AmenitiesStateInterface } from '.';

const actions: ActionTree<AmenitiesStateInterface, StateInterface> = {
  async fetchAmenities(context, pmsPropertyId: number) {
    const params = `?pmsPropertyId=${pmsPropertyId}`;

    return api.get(`/amenities${params}`).then((response: AxiosResponse<AmenityInterface[]>) => {
      context.commit('SET_AMENITIES', response.data);
    });
  },
};

export default actions;
