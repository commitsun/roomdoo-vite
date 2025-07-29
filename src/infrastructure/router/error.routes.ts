import type { RouteRecordRaw } from 'vue-router';

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('@/ui/layouts/LoginLayout.vue'),
    redirect: '/login',
    children: [
      {
        name: 'hotel-not-found',
        path: '/hotel-not-found',
        component: () => import('@/ui/pages/HotelNotFoundPage.vue'),
      },
    ],
  },

  // // Always leave this as last one,
  { path: '/:catchAll(.*)*', component: () => import('@/ui/pages/Error404Page.vue') },
]

