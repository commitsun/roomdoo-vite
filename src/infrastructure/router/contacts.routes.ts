import type { RouteRecordRaw } from 'vue-router';

export const contactsRoutes: RouteRecordRaw[] = [
  {
    path: '/:pmsPropertyId(\\d+)/contacts',
    component: () => import('@/ui/layouts/MainLayout.vue'),
    children: [
      {
        name: 'contacts',
        path: '',
        component: () => import('@/ui/pages/ContactsPage.vue'),
        meta: { requiresAuth: true },
      },
      // {
      //   name: 'contacts-detail',
      //   path: 'detail/:contactId',
      //   components: {
      //     default: () => import('@/ui/pages/ContactsPage.vue'),
      //     drawer: () => import('@/ui/components/contacts/ContactDetail.vue'),
      //   },
      //   meta: { requiresAuth: true },
      // },
      // {
      //   name: 'customers',
      //   path: 'clients',
      //   component: () => import('@/ui/pages/CustomersPage.vue'),
      // },
    ],
  },
];
