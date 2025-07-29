import type { RouteRecordRaw } from 'vue-router';

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('@/ui/layouts/LoginLayout.vue'),
    redirect: '/login',
    children: [
      {
        name: 'login',
        path: '/login/:pmsPropertyId(\\d+)?',
        component: () => import('@/ui/pages/LoginPage.vue'),
      },
      {
        name: 'reset-password',
        path: '/reset-password/:token([^/]+)?',
        component: () => import('@/ui/pages/ResetPasswordPage.vue'),
      },
      {
        name: 'request-password',
        path: '/request-password/:pmsPropertyId(\\d+)?',
        component: () => import('@/ui/pages/RequestPasswordPage.vue'),
      },
    ],
  },
]

