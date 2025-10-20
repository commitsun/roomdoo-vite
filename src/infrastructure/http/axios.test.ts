import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders, AxiosError } from 'axios';
import { api } from '@/infrastructure/http/axios';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';

import router from '@/infrastructure/plugins/router';
import * as dynamicDialogsModule from '@/infrastructure/stores/dynamicDialogs';
import * as userStoreModule from '@/infrastructure/stores/user';

const logout = vi.fn();
const closeAndUnregisterAllDynamicDialogs = vi.fn();
const addTextMessage = vi.fn();
const refreshToken = vi.fn();

// --- helpers for tests below (router + adapter + config typing) ---
import type { AxiosAdapter } from 'axios';
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';

type RetriableConfig<D = unknown> = InternalAxiosRequestConfig<D> & { _retry?: boolean };

function spyRouterReplace() {
  const r = router as Router;
  return vi.spyOn(r, 'replace').mockResolvedValue(undefined);
}

function ensureCurrentRouteRef() {
  const r = router as Router;
  if (!('currentRoute' in r) || !r.currentRoute) {
    // Minimal ref for test purposes.
    // @ts-expect-error: test double
    r.currentRoute = { value: undefined };
  }
}

function setCurrentRoute(name: string, fullPath: string) {
  ensureCurrentRouteRef();
  const r = router as Router;
  // Only need name/fullPath for tested behavior.
  r.currentRoute.value = { name, fullPath } as RouteLocationNormalizedLoaded;
}

function setCurrentRouteUndefined() {
  ensureCurrentRouteRef();
  const r = router as Router;
  // Force undefined to hit fallback branches.
  // @ts-expect-error: explicit undefined for test
  r.currentRoute.value = undefined as unknown as RouteLocationNormalizedLoaded | undefined;
}

vi.mock('@/infrastructure/plugins/i18n', () => ({
  i18n: { global: { locale: { value: 'es-ES' } } },
  t: (k: string) => k,
}));

vi.mock('@/infrastructure/stores/textMessages', () => {
  return {
    useTextMessagesStore: () => ({ addTextMessage }),
  };
});

vi.mock('@/infrastructure/stores/user', () => {
  return {
    useUserStore: () => ({
      refreshToken,
    }),
  };
});

function setAdapter(impl: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse | never>) {
  api.defaults.adapter = impl;
}

function makeAxiosError(
  status: number,
  url: string,
  config: Partial<InternalAxiosRequestConfig> = {},
) {
  const cfg = { url, method: 'get', headers: {}, ...config } as InternalAxiosRequestConfig;
  const response = {
    status,
    statusText: String(status),
    data: {},
    headers: {},
    config: cfg,
  } as AxiosResponse;
  return new AxiosError('Synthetic error', 'ERR_SYNTHETIC', cfg, {}, response);
}

describe('endpoint selection by import.meta.env', () => {
  it('staging: uses STAGING URL: ROOMDOO_API_URL + /pmsApi', async () => {
    vi.resetModules();
    vi.stubEnv('DEV', false);
    vi.stubEnv('MODE', 'staging');
    vi.stubEnv('ROOMDOO_API_URL', 'https://api.stg.example');
    const { api: apiStaging } = await import('@/infrastructure/http/axios');
    expect(apiStaging.defaults.baseURL).toBe('https://api.stg.example/pmsApi');
  });

  it('dev: uses /pmsApi baseURL', async () => {
    vi.resetModules();
    vi.stubEnv('DEV', true);
    vi.stubEnv('MODE', 'development');
    const { api: apiDev } = await import('@/infrastructure/http/axios');
    expect(apiDev.defaults.baseURL).toBe('/pmsApi');
  });

  it('production: uses PRODUCTION URL: xxx.host.roomdoo.com/pmsApi', async () => {
    vi.resetModules();
    vi.stubEnv('DEV', false);
    vi.stubEnv('MODE', 'production');
    const { api: apiProd } = await import('@/infrastructure/http/axios');
    const expected = `${window.location.href.split('.')[0]}.host.roomdoo.com/pmsApi`;
    expect(apiProd.defaults.baseURL).toBe(expected);
  });
});

describe('api request interceptor', () => {
  it('adds Accept-Language from i18n and normalizes headers', async () => {
    let seen: string | undefined;

    setAdapter(async (config) => {
      const headers = config.headers as AxiosHeaders;
      const raw = headers.get('Accept-Language');
      seen = raw == null ? undefined : String(raw);

      return {
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    const res = await api.get('/ping');
    expect(res.status).toBe(200);
    expect(seen).toBe('es_ES'); // 'es-ES' -> 'es_ES'
  });
});

describe('api response interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (router as any).currentRoute = (router as any).currentRoute || { value: null };
  });

  // GENERIC ERRORS
  it('throws an Unauthorized error when login api call returns a 401 error code', async () => {
    setAdapter(async (config) => {
      throw makeAxiosError(401, '/login', config);
    });
    await expect(api.get('/login')).rejects.toBeInstanceOf(UnauthorizedError);
  });
  it('throws an InternalServerError when an api call returns a 500 error code', async () => {
    setAdapter(async (config) => {
      throw makeAxiosError(500, '/whatever', config);
    });
    await expect(api.get('/whatever')).rejects.toBeInstanceOf(InternalServerError);
  });
  it('throws an UnknownError when an api call returns an unhandled error code', async () => {
    setAdapter(async (config) => {
      throw makeAxiosError(418, '/teapot', config);
    });
    await expect(api.get('/teapot')).rejects.toBeInstanceOf(UnknownError);
  });

  // NO TOKEN REFRESH FLOW
  it('launches error on 401 when /refresh-token', async () => {
    refreshToken.mockClear();
    setAdapter(async (config) => {
      throw makeAxiosError(401, '/refresh-token', config);
    });
    await expect(api.get('/refresh-token')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  it('launches error on 401 /user/change-password', async () => {
    refreshToken.mockClear();
    setAdapter(async (config) => {
      throw makeAxiosError(401, '/user/change-password', config);
    });
    await expect(api.get('/user/change-password')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  it('launches error on 401 /login', async () => {
    refreshToken.mockClear();
    setAdapter(async (config) => {
      throw makeAxiosError(401, '/login', config);
    });
    await expect(api.get('/login')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  // TOKEN REFRESH FLOW
  it('401 triggers refresh and retries original request successfully', async () => {
    refreshToken.mockClear();
    let first = true;
    setAdapter(async (config) => {
      if (first) {
        first = false;
        throw makeAxiosError(401, '/secure', config);
      }
      return {
        data: { ok: true, retried: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });
    const res = await api.get('/secure');
    expect(refreshToken).toHaveBeenCalledTimes(1);
  });

  // review from here down

  it('refresh fails with 401 -> logout, session-expired message, close dialogs, redirect to login with redirect, and throws UnauthorizedError', async () => {
    // Put user in a non-login route so redirect should happen.
    setCurrentRoute('dashboard', '/secure?page=1');

    // Spy router.replace with correct typing.
    const replaceSpy = spyRouterReplace();

    // Make user store also expose `logout`.
    type UserStore = ReturnType<typeof userStoreModule.useUserStore>;
    vi.spyOn(userStoreModule, 'useUserStore').mockReturnValue({
      refreshToken,
      logout,
    } as unknown as UserStore);

    // Mock dynamic dialogs store.
    type DynDialogsStore = ReturnType<typeof dynamicDialogsModule.useDynamicDialogsStore>;
    vi.spyOn(dynamicDialogsModule, 'useDynamicDialogsStore').mockReturnValue({
      closeAndUnregisterAllDynamicDialogs,
    } as unknown as DynDialogsStore);

    // Backend returns 401 to trigger refresh flow.
    setAdapter(async (config) => {
      throw makeAxiosError(401, '/secure', config);
    });

    // Force refresh to fail with a 401-like AxiosError (token expired).
    const refreshErr = makeAxiosError(401, '/refresh-token', {});
    refreshToken.mockRejectedValueOnce(refreshErr);

    await expect(api.get('/secure')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(addTextMessage).toHaveBeenCalledWith(
      'error.sessionExpiredTitle',
      'error.sessionExpiredContent',
    );
    expect(closeAndUnregisterAllDynamicDialogs).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/secure?page=1' },
    });
  });

  it('refresh fails with 401 and current route is login -> no redirect, still logout + session-expired + close dialogs, throws UnauthorizedError', async () => {
    setCurrentRoute('login', '/login?foo=bar');

    const replaceSpy = spyRouterReplace();

    type UserStore = ReturnType<typeof userStoreModule.useUserStore>;
    vi.spyOn(userStoreModule, 'useUserStore').mockReturnValue({
      refreshToken,
      logout,
    } as unknown as UserStore);

    type DynDialogsStore = ReturnType<typeof dynamicDialogsModule.useDynamicDialogsStore>;
    vi.spyOn(dynamicDialogsModule, 'useDynamicDialogsStore').mockReturnValue({
      closeAndUnregisterAllDynamicDialogs,
    } as unknown as DynDialogsStore);

    setAdapter(async (config) => {
      throw makeAxiosError(401, '/secure', config);
    });
    const refreshErr = makeAxiosError(401, '/refresh-token', {});
    refreshToken.mockRejectedValueOnce(refreshErr);

    await expect(api.get('/secure')).rejects.toBeInstanceOf(UnauthorizedError);

    // No redirect when already on login.
    expect(replaceSpy).not.toHaveBeenCalled();

    // Still performs logout and UI actions.
    expect(logout).toHaveBeenCalledTimes(1);
    expect(addTextMessage).toHaveBeenCalledWith(
      'error.sessionExpiredTitle',
      'error.sessionExpiredContent',
    );
    expect(closeAndUnregisterAllDynamicDialogs).toHaveBeenCalledTimes(1);
  });

  it('401 concurrent requests: second waits in queue and succeeds after first refresh', async () => {
    // Make refresh succeed once.
    refreshToken.mockResolvedValueOnce(undefined);

    // Adapter behavior:
    // - First attempt of each request -> 401
    // - Retry (config._retry === true) -> 200
    setAdapter(async (config) => {
      const isRetry = (config as RetriableConfig)._retry === true;
      if (!isRetry) {
        throw makeAxiosError(401, '/secure', config);
      }
      return {
        data: { ok: true, retried: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    // Fire two requests "concurrently".
    const p1 = api.get('/secure');
    const p2 = api.get('/secure');

    const [r1, r2] = await Promise.all([p1, p2]);

    // Both should succeed after single refresh.
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.data).toEqual({ ok: true, retried: true });
    expect(r2.data).toEqual({ ok: true, retried: true });

    // Only one refresh call for both requests.
    expect(refreshToken).toHaveBeenCalledTimes(1);

    // No generic error toasts in this successful path.
    expect(addTextMessage).not.toHaveBeenCalled();
  });

  it('processQueue clears queued requests after successful refresh', async () => {
    // Make refresh succeed once (this will flush the queue).
    refreshToken.mockResolvedValueOnce(undefined);

    setAdapter(async (config) => {
      const isRetry = (config as RetriableConfig)._retry === true;
      if (!isRetry) {
        throw makeAxiosError(401, '/secure', config);
      }
      return {
        data: { ok: true, retried: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    const p1 = api.get('/secure');
    const p2 = api.get('/secure');
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.data).toEqual({ ok: true, retried: true });
    expect(r2.data).toEqual({ ok: true, retried: true });

    // Only one refresh for both queued requests.
    expect(refreshToken).toHaveBeenCalledTimes(1);

    // No error toasts in this successful path.
    expect(addTextMessage).not.toHaveBeenCalled();
  });

  it('second concurrent request is queued and then rejected when refresh fails', async () => {
    // Ensure router shape and avoid actual navigation side-effects.
    setCurrentRoute('dashboard', '/secure?page=1');
    spyRouterReplace();

    // Provide logout so the catch block can run fully.
    type UserStore = ReturnType<typeof userStoreModule.useUserStore>;
    vi.spyOn(userStoreModule, 'useUserStore').mockReturnValue({
      refreshToken,
      logout,
    } as unknown as UserStore);

    // Provide dynamic dialogs closer.
    type DynDialogsStore = ReturnType<typeof dynamicDialogsModule.useDynamicDialogsStore>;
    vi.spyOn(dynamicDialogsModule, 'useDynamicDialogsStore').mockReturnValue({
      closeAndUnregisterAllDynamicDialogs,
    } as unknown as DynDialogsStore);

    // Adapter: first attempt -> 401; if a retry happened (_retry === true) -> 200.
    // In this test, because refresh fails, we won't reach the retry path.
    setAdapter(async (config) => {
      const isRetry = (config as RetriableConfig)._retry === true;
      if (!isRetry) {
        throw makeAxiosError(401, '/secure', config);
      }
      return {
        data: { ok: true, retried: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    // Make refresh fail with an Axios 401 (expired refresh token).
    const refreshErr = makeAxiosError(401, '/refresh-token', {});
    refreshToken.mockRejectedValueOnce(refreshErr);

    // Fire two concurrent requests:
    // - p1 triggers refresh and enters the catch path when refresh fails
    // - p2 is queued and rejected via processQueue(error)
    const p1 = api.get('/secure');
    const p2 = api.get('/secure');

    await expect(p1).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(p2).rejects.toBeInstanceOf(AxiosError);

    // Refresh attempted once.
    expect(refreshToken).toHaveBeenCalledTimes(1);

    // UI side-effects happened on refresh failure.
    expect(addTextMessage).toHaveBeenCalledWith(
      'error.sessionExpiredTitle',
      'error.sessionExpiredContent',
    );
    expect(closeAndUnregisterAllDynamicDialogs).toHaveBeenCalledTimes(1);
  });

  it("refresh fails and current route is undefined -> redirect uses '/'", async () => {
    // Arrange router: no current route to force the '|| "/"' fallback.
    setCurrentRouteUndefined();
    const replaceSpy = spyRouterReplace();

    // Provide logout and dialogs closer for the catch branch side-effects.
    type UserStore = ReturnType<typeof userStoreModule.useUserStore>;
    vi.spyOn(userStoreModule, 'useUserStore').mockReturnValue({
      refreshToken,
      logout,
    } as unknown as UserStore);
    type DynDialogsStore = ReturnType<typeof dynamicDialogsModule.useDynamicDialogsStore>;
    vi.spyOn(dynamicDialogsModule, 'useDynamicDialogsStore').mockReturnValue({
      closeAndUnregisterAllDynamicDialogs,
    } as unknown as DynDialogsStore);

    // Original request -> 401 triggers refresh flow.
    setAdapter(async (config) => {
      throw makeAxiosError(401, '/secure', config);
    });
    // Refresh fails with a 401-like AxiosError.
    refreshToken.mockRejectedValueOnce(makeAxiosError(401, '/refresh-token', {}));

    await expect(api.get('/secure')).rejects.toBeInstanceOf(UnauthorizedError);

    // Redirect should use '/' because current?.fullPath is falsy.
    expect(replaceSpy).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/' } });
  });
});
