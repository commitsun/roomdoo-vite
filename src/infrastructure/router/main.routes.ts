import type { RouteRecordRaw } from 'vue-router';

export const mainRoutes: RouteRecordRaw[] = [
  {
    path: '/:pmsPropertyId(\\d+)?',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'dashboard', path: '', component: () => import('@/_legacy/pages/DashboardPage.vue') },
    ],
  },
  {
    path: '/planning/:pmsPropertyId(\\d+)?',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'planning', path: '', component: () => import('@/_legacy/pages/PlanningPage.vue') },
    ],
  },
  {
    path: '/transactions/:pmsPropertyId(\\d+)?',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      {
        name: 'transactions',
        path: '',
        component: () => import('@/_legacy/pages/TransactionsPage.vue'),
      },
    ],
  },
  {
    path: '/invoices/:pmsPropertyId(\\d+)?',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'invoices', path: '', component: () => import('@/_legacy/pages/InvoicesPage.vue') },
    ],
  },
  {
    path: '/partners/:pmsPropertyId(\\d+)?',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      {
        name: 'partners',
        path: '',
        component: () => import('@/_legacy/pages/PartnerListPage.vue'),
      },
    ],
  },
]
