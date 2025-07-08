import { describe, it, expect, vi, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

import { api } from './axios'; // named import with interceptor

import {
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  ForbiddenError,
  ApiError,
} from '@/application/errors';

const mock = new MockAdapter(api);

describe('Axios interceptor', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('should throw NotFoundError on 404', async () => {
    mock.onGet('/test').reply(404);

    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
  });

  it('should throw UnauthorizedError on 401', async () => {
    mock.onGet('/test').reply(401);

    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
    }
  });
  // 403
  it('should throw ForbiddenError on 403', async () => {
    mock.onGet('/test').reply(403);

    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError);
    }
  });

  it('should throw InternalServerError on 500', async () => {
    mock.onGet('/test').reply(500);
    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerError);
    }
  });

  it('should throw ApiError on other status codes', async () => {
    mock.onGet('/test').reply(503);

    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });
});
