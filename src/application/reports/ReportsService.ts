import type { AxiosResponse } from 'axios';

import type { ReportsRepository } from '@/domain/repositories/ReportsRepository';

export class ReportsService {
  constructor(private reportsRepository: ReportsRepository) {}

  kellyReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>> {
    return this.reportsRepository.kellyReport(pmsPropertyId, date);
  }

  arrivalsReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>> {
    return this.reportsRepository.arrivalsReport(pmsPropertyId, date);
  }

  departuresReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>> {
    return this.reportsRepository.departuresReport(pmsPropertyId, date);
  }

  servicesReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AxiosResponse<Blob>> {
    return this.reportsRepository.servicesReport(pmsPropertyId, dateFrom, dateTo);
  }

  transactionsReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AxiosResponse<Blob>> {
    return this.reportsRepository.transactionsReport(pmsPropertyId, dateFrom, dateTo);
  }

  ineReport(pmsPropertyId: number, dateFrom: Date, dateTo: Date): Promise<AxiosResponse<Blob>> {
    return this.reportsRepository.ineReport(pmsPropertyId, dateFrom, dateTo);
  }
}
