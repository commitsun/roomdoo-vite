import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ReportsService } from './ReportsService';

import type { ReportsRepository } from '@/domain/repositories/ReportsRepository';

describe('ReportsService', () => {
  let service: ReportsService;
  let repoMock: Partial<Record<keyof ReportsRepository, any>>;

  beforeEach(() => {
    // Lightweight mock of the repository
    repoMock = {
      kellyReport: vi.fn(),
      arrivalsReport: vi.fn(),
      departuresReport: vi.fn(),
      servicesReport: vi.fn(),
      transactionsReport: vi.fn(),
      ineReport: vi.fn(),
    };
    service = new ReportsService(repoMock as ReportsRepository);
  });

  describe('kellyReport', () => {
    it('delegates to repository with pmsPropertyId and date and returns data', async () => {
      const pmsPropertyId = 1;
      const date = new Date('2025-01-01T00:00:00Z');
      const response = { data: 'kelly-report-csv' };

      repoMock.kellyReport!.mockResolvedValue(response);

      const result = await service.kellyReport(pmsPropertyId, date);

      expect(repoMock.kellyReport).toHaveBeenCalledWith(pmsPropertyId, date);
      expect(result).toBe(response);
    });

    it('propagates repository errors', async () => {
      const pmsPropertyId = 1;
      const date = new Date('2025-01-01T00:00:00Z');
      const err = new Error('kelly error');

      repoMock.kellyReport!.mockRejectedValue(err);

      await expect(service.kellyReport(pmsPropertyId, date)).rejects.toThrow(err);
    });
  });

  describe('arrivalsReport', () => {
    it('delegates to repository with pmsPropertyId and date and returns data', async () => {
      const pmsPropertyId = 2;
      const date = new Date('2025-02-01T00:00:00Z');
      const response = { data: 'arrivals-report-csv' };

      repoMock.arrivalsReport!.mockResolvedValue(response);

      const result = await service.arrivalsReport(pmsPropertyId, date);

      expect(repoMock.arrivalsReport).toHaveBeenCalledWith(pmsPropertyId, date);
      expect(result).toBe(response);
    });

    it('propagates repository errors', async () => {
      const pmsPropertyId = 2;
      const date = new Date('2025-02-01T00:00:00Z');
      const err = new Error('arrivals error');

      repoMock.arrivalsReport!.mockRejectedValue(err);

      await expect(service.arrivalsReport(pmsPropertyId, date)).rejects.toThrow(err);
    });
  });

  describe('departuresReport', () => {
    it('delegates to repository with pmsPropertyId and date and returns data', async () => {
      const pmsPropertyId = 3;
      const date = new Date('2025-03-01T00:00:00Z');
      const response = { data: 'departures-report-csv' };

      repoMock.departuresReport!.mockResolvedValue(response);

      const result = await service.departuresReport(pmsPropertyId, date);

      expect(repoMock.departuresReport).toHaveBeenCalledWith(pmsPropertyId, date);
      expect(result).toBe(response);
    });

    it('propagates repository errors', async () => {
      const pmsPropertyId = 3;
      const date = new Date('2025-03-01T00:00:00Z');
      const err = new Error('departures error');

      repoMock.departuresReport!.mockRejectedValue(err);

      await expect(service.departuresReport(pmsPropertyId, date)).rejects.toThrow(err);
    });
  });

  describe('servicesReport', () => {
    it('delegates to repository with pmsPropertyId, dateFrom and dateTo and returns data', async () => {
      const pmsPropertyId = 4;
      const dateFrom = new Date('2025-04-01T00:00:00Z');
      const dateTo = new Date('2025-04-30T23:59:59Z');
      const response = { data: 'services-report-csv' };

      repoMock.servicesReport!.mockResolvedValue(response);

      const result = await service.servicesReport(pmsPropertyId, dateFrom, dateTo);

      expect(repoMock.servicesReport).toHaveBeenCalledWith(pmsPropertyId, dateFrom, dateTo);
      expect(result).toBe(response);
    });

    it('propagates repository errors', async () => {
      const pmsPropertyId = 4;
      const dateFrom = new Date('2025-04-01T00:00:00Z');
      const dateTo = new Date('2025-04-30T23:59:59Z');
      const err = new Error('services error');

      repoMock.servicesReport!.mockRejectedValue(err);

      await expect(service.servicesReport(pmsPropertyId, dateFrom, dateTo)).rejects.toThrow(err);
    });
  });

  describe('transactionsReport', () => {
    it('delegates to repository with pmsPropertyId, dateFrom and dateTo and returns data', async () => {
      const pmsPropertyId = 5;
      const dateFrom = new Date('2025-05-01T00:00:00Z');
      const dateTo = new Date('2025-05-31T23:59:59Z');
      const response = { data: 'transactions-report-csv' };

      repoMock.transactionsReport!.mockResolvedValue(response);

      const result = await service.transactionsReport(pmsPropertyId, dateFrom, dateTo);

      expect(repoMock.transactionsReport).toHaveBeenCalledWith(pmsPropertyId, dateFrom, dateTo);
      expect(result).toBe(response);
    });

    it('propagates repository errors', async () => {
      const pmsPropertyId = 5;
      const dateFrom = new Date('2025-05-01T00:00:00Z');
      const dateTo = new Date('2025-05-31T23:59:59Z');
      const err = new Error('transactions error');

      repoMock.transactionsReport!.mockRejectedValue(err);

      await expect(service.transactionsReport(pmsPropertyId, dateFrom, dateTo)).rejects.toThrow(
        err,
      );
    });
  });

  describe('ineReport', () => {
    it('delegates to repository with pmsPropertyId, dateFrom and dateTo and returns data', async () => {
      const pmsPropertyId = 6;
      const dateFrom = new Date('2025-06-01T00:00:00Z');
      const dateTo = new Date('2025-06-30T23:59:59Z');
      const response = { data: 'ine-report-csv' };

      repoMock.ineReport!.mockResolvedValue(response);

      const result = await service.ineReport(pmsPropertyId, dateFrom, dateTo);

      expect(repoMock.ineReport).toHaveBeenCalledWith(pmsPropertyId, dateFrom, dateTo);
      expect(result).toBe(response);
    });

    it('propagates repository errors', async () => {
      const pmsPropertyId = 6;
      const dateFrom = new Date('2025-06-01T00:00:00Z');
      const dateTo = new Date('2025-06-30T23:59:59Z');
      const err = new Error('ine error');

      repoMock.ineReport!.mockRejectedValue(err);

      await expect(service.ineReport(pmsPropertyId, dateFrom, dateTo)).rejects.toThrow(err);
    });
  });
});
