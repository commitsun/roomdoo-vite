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
        name: 'request-reset-password',
        path: '/request-reset-password/:pmsPropertyId(\\d+)?',
        component: () => import('@/ui/pages/RequestResetPasswordPage.vue'),
      },
    ],
  },
]

