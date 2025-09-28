import { describe, it, expect, vi, type Mock } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders, AxiosError } from 'axios';
import { api } from '@/infrastructure/http/axios';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { InternalServerError } from '@/application/shared/InternalServerError';
import { UnknownError } from '@/application/shared/UnknownError';

vi.mock('@/infrastructure/plugins/i18n', () => ({
  i18n: { global: { locale: { value: 'es-ES' } } },
  t: (k: string) => k,
}));

const addTextMessage = vi.fn();
vi.mock('@/infrastructure/stores/textMessages', () => {
  return {
    useTextMessagesStore: () => ({ addTextMessage }),
  };
});

function setAdapter(impl: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse | never>) {
  api.defaults.adapter = impl;
}

function makeAxiosError(
  status: number,
  url: string,
  config: Partial<InternalAxiosRequestConfig> = {}
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

describe('api response interceptor - final switch raises', () => {
  it('401 on /login -> UnauthorizedError (no refresh path)', async () => {
    addTextMessage.mockClear();

    setAdapter(async (config) => {
      throw makeAxiosError(401, '/login', config);
    });

    await expect(api.get('/login')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(addTextMessage).not.toHaveBeenCalled();
  });

  it('500 -> InternalServerError and shows internalError message', async () => {
    addTextMessage.mockClear();

    setAdapter(async (config) => {
      throw makeAxiosError(500, '/whatever', config);
    });

    await expect(api.get('/whatever')).rejects.toBeInstanceOf(InternalServerError);
    expect(addTextMessage).toHaveBeenCalledWith('error.somethingWentWrong', 'error.internalError');
  });

  it('Unknown status (418) -> UnknownError and shows unknownError message', async () => {
    addTextMessage.mockClear();

    setAdapter(async (config) => {
      throw makeAxiosError(418, '/teapot', config);
    });

    await expect(api.get('/teapot')).rejects.toBeInstanceOf(UnknownError);
    expect(addTextMessage).toHaveBeenCalledWith('error.somethingWentWrong', 'error.unknownError');
  });
});
