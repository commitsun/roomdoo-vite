import type { RouteRecordRaw } from "vue-router";

import { authRoutes } from '@/infrastructure/router/auth.routes';
import { mainRoutes } from '@/infrastructure/router/main.routes';
import { publicRoutes } from '@/infrastructure/router/public.routes';
import { errorRoutes } from '@/infrastructure/router/error.routes';

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...mainRoutes,
  ...publicRoutes,
  ...errorRoutes,
];

export default routes;
