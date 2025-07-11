import type { ActionTree } from 'vuex';
import axios, { type AxiosResponse } from 'axios';

import type { AddressInterface } from '@/_legacy/interfaces/AddressInterface';
import { api } from '@/_legacy/http/axios';

import type { StateInterface } from '../index';
import type { AddressStateInterface } from '.';

const { CancelToken } = axios;
let cancel: (() => void) | undefined;

const actions: ActionTree<AddressStateInterface, StateInterface> = {
  async fetchAddress(context, payload: string) {
    const params = `?address=${payload}`;
    if (cancel !== undefined) {
      cancel();
    }
    return api
      .get(`/zips${params}`, {
        cancelToken: new CancelToken((c) => {
          cancel = c;
        }),
      })
      .then((response: AxiosResponse<AddressInterface>) => {
        if (response) {
          context.commit('SET_ADDRESSES', response.data);
        }
      });
  },

  async fetchAddressByZip(context, payload: string) {
    return api.get(`/zips/${payload}`).then((response: AxiosResponse<AddressInterface>) => {
      if (response.data.cityId || response.data.countryId || response.data.stateId) {
        context.commit('SET_ADDRESS', response.data);
      }
    });
  },
  removeAddresses(context) {
    context.commit('REMOVE_ADDRESSES');
  },
  removeAddress(context) {
    context.commit('REMOVE_ADDRESS');
  },
};

export default actions;
