import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // -----------------------------------------
  // index dummy

  // -----------------------------------------
  // login
  {
    path: '/login/:pmsPropertyId(\\d+)?',
    component: () => import('@/layouts/LoginLayout.vue'),
    children: [{ name: 'login', path: '', component: () => import('@/pages/LoginPage.vue') }],
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
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { name: 'dashboard', path: '', component: () => import('@/pages/DashboardPage.vue') },
    ],
  },
  // planning
  {
    path: '/planning/:pmsPropertyId(\\d+)?',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [{ name: 'planning', path: '', component: () => import('@/pages/PlanningPage.vue') }],
  },
  // -----------------------------------------
  // transactions
  {
    path: '/transactions/:pmsPropertyId(\\d+)?',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { name: 'transactions', path: '', component: () => import('@/pages/TransactionsPage.vue') },
    ],
  },
  // -----------------------------------------
  // invoices
  {
    path: '/invoices/:pmsPropertyId(\\d+)?',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [{ name: 'invoices', path: '', component: () => import('@/pages/InvoicesPage.vue') }],
  },

  // partners
  {
    path: '/partners/:pmsPropertyId(\\d+)?',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { name: 'partners', path: '', component: () => import('@/pages/PartnerListPage.vue') },
    ],
  },
  // folio precheckin
  {
    path: '/:folioId([^/]+)/precheckin/:folioToken([^/]+)',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        name: 'folio-precheckin',
        path: '',
        component: () => import('@/pages/PublicFolioPage.vue'),
      },
    ],
  },
  // reservation precheckin
  {
    path: '/:reservationId([^/]+)/precheckin-reservation/:reservationToken([^/]+)',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        name: 'reservation-precheckin',
        path: '',
        component: () => import('@/pages/PublicReservationPage.vue'),
      },
    ],
  },
  // test
  {
    path: '/test',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [{ name: 'test', path: '', component: () => import('@/pages/TestPage.vue') }],
  },
  // // 404
  // { path: '/404', component: () => import('@/pages/Error404Page.vue') },
  // // Always leave this as last one,
  // // but you can also remove it
  // { path: '/:catchAll(.*)*', component: () => import('@/pages/Error404Page.vue') },
];

export default routes;
