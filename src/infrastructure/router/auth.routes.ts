import type { RouteRecordRaw } from 'vue-router';

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/LoginLayout.vue'),
    children: [
      {
        name: 'login',
        path: '', // URL final queda igual que el padre
        component: () => import('@/ui/pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/reset-password/:token([^/]+)?',
    component: () => import('@/ui/layouts/LoginLayout.vue'),
    children: [
      {
        name: 'reset-password',
        path: '',
        component: () => import('@/ui/pages/ResetPasswordPage.vue'),
      },
    ],
  },
  {
    path: '/request-reset-password/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/LoginLayout.vue'),
    children: [
      {
        name: 'request-reset-password',
        path: '',
        component: () => import('@/ui/pages/RequestResetPasswordPage.vue'),
      },
    ],
  },
];
