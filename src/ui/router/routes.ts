import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // login
  {
    path: '',
    component: () => import('@/ui/layouts/LoginLayout.vue'),
    children: [
      {
        name: 'login',
        path: '/login/:pmsPropertyId(\\d+)?',
        component: () => import('@/ui/pages/LoginPage.vue'),
      },
      {
        name: 'reset-password',
        path: '/reset-password/:pmsPropertyId(\\d+)?',
        component: () => import('@/ui/pages/ResetPasswordPage.vue'),
      },
      {
        name: 'hotel-not-found',
        path: '/hotel-not-found',
        component: () => import('@/ui/pages/HotelNotFoundPage.vue'),
      },
    ],
  },
  // legacy login
  {
    path: '/legacy/login/:pmsPropertyId(\\d+)?',
    component: () => import('@/legacy/layouts/LoginLayout.vue'),
    children: [
      {
        name: 'legacy-login',
        path: '',
        component: () => import('@/legacy/pages/LoginPage.vue'),
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
  // // Always leave this as last one,
  { path: '/:catchAll(.*)*', component: () => import('@/ui/pages/Error404Page.vue') },
];

export default routes;
