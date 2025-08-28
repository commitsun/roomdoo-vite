import type { ActionTree } from 'vuex';
import type { StateInterface } from '../index';
import type { LinksStateInterface } from '.';
import { getCookie } from '@/legacy/utils/cookies';

const actions: ActionTree<LinksStateInterface, StateInterface> = {
  async fetchLink(context, params: { pmsPropertyId: number; linkId: number }) {
    let endPoint = `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;
    if (window.location.href.includes('vite.roomdoo.com')) {
      endPoint = 'https://staging.odoo.aldahotels.moduon.net/pmsApi';
    } else if (import.meta.env.DEV) {
      endPoint = '/pmsApi';
    }
    const response = await fetch(
      `${endPoint}/pmsProperties/${params.pmsPropertyId}/links/${params.linkId}`,
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
