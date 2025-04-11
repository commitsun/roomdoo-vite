import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { AmenityTypeInterface } from 'src/interfaces/AmenityTypeInterface';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { AmenityTypesStateInterface } from '.';

const actions: ActionTree<AmenityTypesStateInterface, StateInterface> = {
  async fetchAmenityTypes(context, pmsPropertyId: number) {
    const params = `?pmsPropertyId=${pmsPropertyId}`;

    return api
      .get(`/amenity-types${params}`)
      .then((response: AxiosResponse<AmenityTypeInterface[]>) => {
        context.commit('SET_AMENITY_TYPES', response.data);
      });
  },
};

export default actions;
