import type { RouteRecordRaw } from 'vue-router';

import { authRoutes } from '@/infrastructure/router/auth.routes';
import { mainRoutes } from '@/infrastructure/router/main.routes';
import { publicRoutes } from '@/infrastructure/router/public.routes';
import { errorRoutes } from '@/infrastructure/router/error.routes';
import { contactsRoutes } from '@/infrastructure/router/contacts.routes';

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...mainRoutes,
  ...publicRoutes,
  ...contactsRoutes,
  // Ensure error routes are always last
  ...errorRoutes,
];

export default routes;
