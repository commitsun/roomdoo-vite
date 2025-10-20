import type { RouteRecordRaw } from 'vue-router';

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/instance-not-found',
    component: () => import('@/ui/layouts/InstanceLayout.vue'),
    children: [
      {
        name: 'instance-not-found',
        path: '',
        component: () => import('@/ui/pages/HotelNotFoundPage.vue'),
      },
    ],
  },
  // Always leave this as last one,
  {
    path: '/:catchAll(.*)*',
    name: '404-not-found',
    component: () => import('@/ui/pages/Error404Page.vue'),
  },
];
