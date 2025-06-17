import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // -----------------------------------------
  // index dummy

  // -----------------------------------------
  // login
  {
    path: '/login/:pmsPropertyId(\\d+)?',
    component: () => import('@/layouts/LoginLayout.vue'),
    children: [
      { name: 'login', path: '', component: () => import('@/pages/LoginPage.vue') },
      {
        name: 'reset-password',
        path: 'reset-password',
        component: () => import('@/pages/ResetPasswordPage.vue'),
      },
      {
        name: 'hotel-not-found',
        path: 'hotel-not-found',
        component: () => import('@/pages/HotelNotFoundPage.vue'),
      },
    ],
  },

  // // -----------------------------------------
  // // reset password
  // {
  //   path: '/reset-password/:token([^/]+)?',
  //   component: () => import('layouts/LoginLayout.vue'),
  //   children: [{ name: 'resetPassword', path: '', component: () => import('@/pages/ResetPasswordPage.vue') },
  //   ],
  // },
  // // -----------------------------------------
  // // dashboard (initial page)
  {
    path: '/:pmsPropertyId(\\d+)?',
    component: () => import('@/legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'dashboard', path: '', component: () => import('@/legacy/pages/DashboardPage.vue') },
    ],
  },
  // planning
  {
    path: '/planning/:pmsPropertyId(\\d+)?',
    component: () => import('@/legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'planning', path: '', component: () => import('@/legacy/pages/PlanningPage.vue') },
    ],
  },
  // -----------------------------------------
  // transactions
  {
    path: '/transactions/:pmsPropertyId(\\d+)?',
    component: () => import('@/legacy/layouts/MainLayout.vue'),
    children: [
      {
        name: 'transactions',
        path: '',
        component: () => import('@/legacy/pages/TransactionsPage.vue'),
      },
    ],
  },
  // -----------------------------------------
  // invoices
  {
    path: '/invoices/:pmsPropertyId(\\d+)?',
    component: () => import('@/legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'invoices', path: '', component: () => import('@/legacy/pages/InvoicesPage.vue') },
    ],
  },

  // partners
  {
    path: '/partners/:pmsPropertyId(\\d+)?',
    component: () => import('@/legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'partners', path: '', component: () => import('@/legacy/pages/PartnerListPage.vue') },
    ],
  },
  // folio precheckin
  {
    path: '/:folioId([^/]+)/precheckin/:folioToken([^/]+)/:lang([a-z]{2})?',
    component: () => import('@/legacy/layouts/PublicLayout.vue'),
    children: [
      {
        name: 'folio-precheckin',
        path: '',
        component: () => import('@/legacy/pages/PublicFolioPage.vue'),
      },
    ],
  },

  // reservation precheckin
  {
    path: '/:reservationId([^/]+)/precheckin-reservation/:reservationToken([^/]+)/:lang([a-z]{2})?',
    component: () => import('@/legacy/layouts/PublicLayout.vue'),
    children: [
      {
        name: 'reservation-precheckin',
        path: '',
        component: () => import('@/legacy/pages/PublicReservationPage.vue'),
      },
    ],
  },
  // test
  {
    path: '/test',
    component: () => import('@/legacy/layouts/MainLayout.vue'),
    children: [{ name: 'test', path: '', component: () => import('@/legacy/pages/TestPage.vue') }],
  },
  // // 404
  // { path: '/404', component: () => import('@/pages/Error404Page.vue') },
  // // Always leave this as last one,
  // // but you can also remove it
  // { path: '/:catchAll(.*)*', component: () => import('@/pages/Error404Page.vue') },
];

export default routes;
