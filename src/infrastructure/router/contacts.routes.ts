import type { RouteRecordRaw } from 'vue-router';

export const contactsRoutes: RouteRecordRaw[] = [
  {
    path: '/contacts/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/MainLayout.vue'),
    children: [
      {
        name: 'contacts',
        path: '',
        component: () => import('@/ui/pages/ContactsAllPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];
