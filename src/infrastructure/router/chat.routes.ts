import type { RouteRecordRaw } from 'vue-router';

export const chatRoutes: RouteRecordRaw[] = [
  {
    path: '/chat/:chatId?',
    name: 'chat',
    component: () => import('@/ui/layouts/ChatLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/ui/pages/ChatPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];
