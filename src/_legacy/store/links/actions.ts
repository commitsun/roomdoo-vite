import type { ActionTree } from 'vuex';
import type { StateInterface } from '@/_legacy/store/index';
import type { LinksStateInterface } from '.';
import { getCookie } from '@/_legacy/utils/cookies';

const actions: ActionTree<LinksStateInterface, StateInterface> = {
  async fetchLink(context, params: { pmsPropertyId: number; linkId: number }) {
    let endPoint;
    if (import.meta.env.DEV) {
      endPoint = '/pmsApi';
    } else if (import.meta.env.MODE === 'staging') {
      endPoint = import.meta.env.ROOMDOO_API_URL + '/pmsApi';
    } else {
      endPoint = `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;
    }

    const response = await fetch(
      `${endPoint}/pms-properties/${params.pmsPropertyId}/links/${params.linkId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${getCookie('jwt')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching link: ${response.statusText}`);
    }

    return response.json();
  },
};

export default actions;
