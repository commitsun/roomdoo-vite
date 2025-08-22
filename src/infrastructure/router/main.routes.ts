import type { RouteRecordRaw } from 'vue-router';

export const mainRoutes: RouteRecordRaw[] = [
  {
    path: '/:pmsPropertyId(\\d+)',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'dashboard', path: '', component: () => import('@/_legacy/pages/DashboardPage.vue') },
    ],
  },
  {
    path: '/:pmsPropertyId(\\d+)/planning',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'planning', path: '', component: () => import('@/_legacy/pages/PlanningPage.vue') },
    ],
  },
  {
    path: '/:pmsPropertyId(\\d+)/transactions',
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
    path: '/:pmsPropertyId(\\d+)/invoices',
    component: () => import('@/_legacy/layouts/MainLayout.vue'),
    children: [
      { name: 'invoices', path: '', component: () => import('@/_legacy/pages/InvoicesPage.vue') },
    ],
  },
];
