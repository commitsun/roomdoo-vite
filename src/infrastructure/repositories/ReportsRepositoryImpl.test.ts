import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';
import { ReportsRepositoryImpl } from '@/infrastructure/repositories/ReportsRepositoryImpl';

describe('ReportsRepositoryImpl', () => {
  let repo: ReportsRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ReportsRepositoryImpl();
  });

  it('calls kellyReport with correct URL and returns data', async () => {
    // arrange
    const pmsPropertyId = 1;
    const date = new Date(2024, 4, 10); // 2024-05-10
    const response = { data: 'kelly-report-csv' };

    vi.mocked(api.get).mockResolvedValue(response);

    // act
    const result = await repo.kellyReport(pmsPropertyId, date);

    // assert
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      '/reports/kelly-report?pmsPropertyId=1&dateFrom=2024-05-10',
    );
    expect(result).toBe(response);
  });

  it('calls arrivalsReport with correct URL and returns data', async () => {
    // arrange
    const pmsPropertyId = 2;
    const date = new Date(2024, 0, 1); // 2024-01-01
    const response = { data: 'arrivals-report-csv' };

    vi.mocked(api.get).mockResolvedValue(response);

    // act
    const result = await repo.arrivalsReport(pmsPropertyId, date);

    // assert
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      '/reports/arrivals-report?pmsPropertyId=2&dateFrom=2024-01-01',
    );
    expect(result).toBe(response);
  });

  it('calls departuresReport with correct URL and returns data', async () => {
    // arrange
    const pmsPropertyId = 3;
    const date = new Date(2024, 6, 15); // 2024-07-15
    const response = { data: 'departures-report-csv' };

    vi.mocked(api.get).mockResolvedValue(response);

    // act
    const result = await repo.departuresReport(pmsPropertyId, date);

    // assert
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      '/reports/departures-report?pmsPropertyId=3&dateFrom=2024-07-15',
    );
    expect(result).toBe(response);
  });

  it('calls servicesReport with correct URL and returns data', async () => {
    // arrange
    const pmsPropertyId = 4;
    const dateFrom = new Date(2024, 3, 1); // 2024-04-01
    const dateTo = new Date(2024, 3, 30); // 2024-04-30
    const response = { data: 'services-report-csv' };

    vi.mocked(api.get).mockResolvedValue(response);

    // act
    const result = await repo.servicesReport(pmsPropertyId, dateFrom, dateTo);

    // assert
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      '/reports/services-report?pmsPropertyId=4&dateFrom=2024-04-01&dateTo=2024-04-30',
    );
    expect(result).toBe(response);
  });

  it('calls transactionsReport with correct URL and returns data', async () => {
    // arrange
    const pmsPropertyId = 5;
    const dateFrom = new Date(2024, 1, 1); // 2024-02-01
    const dateTo = new Date(2024, 1, 29); // 2024-02-29
    const response = { data: 'transactions-report-csv' };

    vi.mocked(api.get).mockResolvedValue(response);

    // act
    const result = await repo.transactionsReport(pmsPropertyId, dateFrom, dateTo);

    // assert
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      '/reports/transactions-report?pmsPropertyId=5&dateFrom=2024-02-01&dateTo=2024-02-29',
    );
    expect(result).toBe(response);
  });

  it('calls ineReport with correct URL and returns data', async () => {
    // arrange
    const pmsPropertyId = 6;
    const dateFrom = new Date(2024, 8, 1); // 2024-09-01
    const dateTo = new Date(2024, 8, 30); // 2024-09-30
    const response = { data: 'ine-report-csv' };

    vi.mocked(api.get).mockResolvedValue(response);

    // act
    const result = await repo.ineReport(pmsPropertyId, dateFrom, dateTo);

    // assert
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      '/reports/ine-report?pmsPropertyId=6&dateFrom=2024-09-01&dateTo=2024-09-30',
    );
    expect(result).toBe(response);
  });

  it('propagates axios errors for kellyReport', async () => {
    // arrange
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    // act & assert
    await expect(
      repo.kellyReport(1, new Date(2024, 0, 1)), // 2024-01-01
    ).rejects.toThrow(err);
  });

  it('propagates axios errors for servicesReport', async () => {
    // arrange
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    // act & assert
    await expect(
      repo.servicesReport(1, new Date(2024, 0, 1), new Date(2024, 0, 31)),
    ).rejects.toThrow(err);
  });

  it('propagates axios errors for ineReport', async () => {
    // arrange
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    // act & assert
    await expect(repo.ineReport(1, new Date(2024, 0, 1), new Date(2024, 0, 31))).rejects.toThrow(
      err,
    );
  });
});
