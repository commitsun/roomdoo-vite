import type { RouteRecordRaw } from 'vue-router';

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/:folioId([^/]+)/precheckin/:folioToken([^/]+)/:lang([a-z]{2})?',
    component: () => import('@/_legacy/layouts/PublicLayout.vue'),
    children: [
      {
        name: 'folio-precheckin',
        path: '',
        component: () => import('@/_legacy/pages/PublicFolioPage.vue'),
      },
    ],
  },

  {
    path: '/:reservationId([^/]+)/precheckin-reservation/:reservationToken([^/]+)/:lang([a-z]{2})?',
    component: () => import('@/_legacy/layouts/PublicLayout.vue'),
    children: [
      {
        name: 'reservation-precheckin',
        path: '',
        component: () => import('@/_legacy/pages/PublicReservationPage.vue'),
      },
    ],
  },
];
