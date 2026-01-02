import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { PayloadAvailabilityRoomsInterface } from '@/legacy/interfaces/PayloadAvailabilityRooms';
import type { StateInterface } from '../index';
import type { RoomsStateInterface } from '.';

const actions: ActionTree<RoomsStateInterface, StateInterface> = {
  async fetchRooms(context, propertyId: number) {
    return api.get(`/rooms?pmsPropertyId=${propertyId.toString()}`).then((response) => {
      context.commit('SET_ROOMS', response.data);
    });
  },

  async fetchRoomsByAvailability(context, payload: PayloadAvailabilityRoomsInterface) {
    const from = `${payload.availabilityFrom.getFullYear()}-${(
      payload.availabilityFrom.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${payload.availabilityFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.availabilityTo.getFullYear()}-${(payload.availabilityTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.availabilityTo.getDate().toString().padStart(2, '0')}`;
    let currentLines = '';
    if (payload.currentLines) {
      payload.currentLines.forEach((el) => {
        currentLines += `&currentLines[]=${el}`;
      });
    }
    let params = `?pmsPropertyId=${payload.pmsPropertyId}&availabilityFrom=${from}&availabilityTo=${to}${currentLines}`;
    if (payload.pricelistId) {
      params += `&pricelistId=${payload.pricelistId}`;
    }

    return api.get(`/rooms${params}`);
  },

  async updateRoom(context, room: { id: number; data: Partial<RoomsStateInterface['rooms'][0]> }) {
    return api.patch(`/rooms/p/${room.id}`, room.data);
  },
};

export default actions;
