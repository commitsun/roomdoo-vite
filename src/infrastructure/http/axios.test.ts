import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders, AxiosError } from 'axios';
import { api } from '@/infrastructure/http/axios';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';

import * as dynamicDialogsModule from '@/infrastructure/stores/dynamicDialogs';
import * as userStoreModule from '@/infrastructure/stores/user';

const logout = vi.fn();
const closeAndUnregisterAllDynamicDialogs = vi.fn();
const addTextMessage = vi.fn();
const refreshToken = vi.fn();

const { routerReplace, routerCurrentRoute } = vi.hoisted(() => ({
  routerReplace: vi.fn().mockResolvedValue(undefined),
  routerCurrentRoute: { value: { name: 'dashboard', fullPath: '/' } as any },
}));

// --- helpers for tests below (router + adapter + config typing) ---
import type { AxiosAdapter } from 'axios';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

type RetriableConfig<D = unknown> = InternalAxiosRequestConfig<D> & { _retry?: boolean };

function setCurrentRoute(name: string, fullPath: string) {
  routerCurrentRoute.value = { name, fullPath } as RouteLocationNormalizedLoaded;
}

function setCurrentRouteUndefined() {
  // Force undefined to hit fallback branches.
  routerCurrentRoute.value = undefined as unknown as RouteLocationNormalizedLoaded | undefined;
}

vi.mock('@/infrastructure/plugins/router', () => ({
  default: {
    replace: routerReplace,
    currentRoute: routerCurrentRoute,
  },
}));

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

function setAdapter(impl: AxiosAdapter) {
  api.defaults.adapter = impl;
}

function makeAxiosError(
  status: number,
  url: string,
  config: Partial<InternalAxiosRequestConfig>,
) {
  return new AxiosError(`Request failed with status code ${status}`, undefined, config, undefined, {
    data: { detail: 'detail' },
    status,
    statusText: 'ERR',
    headers: {},
    config,
  });
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
    routerCurrentRoute.value = routerCurrentRoute.value || null;
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

  it('throws an UnknownError when an api call returns an unknown error code', async () => {
    setAdapter(async (config) => {
      throw makeAxiosError(999, '/whatever', config);
    });
    await expect(api.get('/whatever')).rejects.toBeInstanceOf(UnknownError);
  });

  it('throws the proper error and passes detail string from server response', async () => {
    setAdapter(async (config) => {
      const err = makeAxiosError(400, '/whatever', config);
      (err as any).response.data = { detail: 'some-detail' };
      throw err;
    });
    await expect(api.get('/whatever')).rejects.toMatchObject({ message: 'some-detail' });
  });
});
