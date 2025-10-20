import type { RouteRecordRaw } from 'vue-router';

export const contactsRoutes: RouteRecordRaw[] = [
  {
    path: '/contacts/:pmsPropertyId(\\d+)?',
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
  {
    path: '/customers/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/MainLayout.vue'),
    children: [
      {
        name: 'customers',
        path: '',
        component: () => import('@/ui/pages/CustomersPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/guests/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/MainLayout.vue'),
    children: [
      {
        name: 'guests',
        path: '',
        component: () => import('@/ui/pages/GuestsPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/agencies/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/MainLayout.vue'),
    children: [
      {
        name: 'agencies',
        path: '',
        component: () => import('@/ui/pages/AgenciesPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/suppliers/:pmsPropertyId(\\d+)?',
    component: () => import('@/ui/layouts/MainLayout.vue'),
    children: [
      {
        name: 'suppliers',
        path: '',
        component: () => import('@/ui/pages/SuppliersPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];
