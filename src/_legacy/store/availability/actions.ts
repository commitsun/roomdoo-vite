import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { AvailabilityInterface } from '@/_legacy/interfaces/AvailabilityInterface';
import { api } from '@/_legacy/http/axios';
import type { StateInterface } from '../index';
import type { AvailabilityStateInterface } from '.';

const actions: ActionTree<AvailabilityStateInterface, StateInterface> = {
  async fetchAvailability(
    context,
    payload: {
      pmsPropertyId: number;
      from: Date;
      to: Date;
      currentLines: number[] | undefined;
      roomTypeId?: number;
    }
  ) {
    const from = `${payload.from.getFullYear()}-${(payload.from.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.from.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.to.getFullYear()}-${(payload.to.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.to.getDate().toString().padStart(2, '0')}`;
    let params = `?availabilityFrom=${from}&availabilityTo=${to}&pmsPropertyId=${payload.pmsPropertyId}`;
    if (payload.currentLines) {
      payload.currentLines.forEach((el) => {
        params += `&currentLines[]=${el}`;
      });
    }
    if (payload.roomTypeId) {
      params += `&roomTypeId=${payload.roomTypeId}`;
    }

    return api.get(`/avails${params}`).then((response: AxiosResponse<AvailabilityInterface>) => {
      if (response.data) {
        context.commit('SET_AVAILABILITY', response.data);
      }
    });
  },
  async fetchNumAvailRooms(
    context,
    payload: {
      pmsPropertyId: number;
      from: Date;
      to: Date;
      pricelistId?: number;
    }
  ) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.from.getFullYear()}-${(payload.from.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.from.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.to.getFullYear()}-${(payload.to.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.to.getDate().toString().padStart(2, '0')}`;
    params += `&availabilityFrom=${from}&availabilityTo=${to}`;
    if (payload.pricelistId) {
      params += `&pricelistId=${payload.pricelistId}`;
    }
    return api.get(`/avails/count-avail-rooms${params}`);
  },
};

export default actions;
