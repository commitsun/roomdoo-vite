import type { AxiosResponse } from 'axios';

export interface ReportsRepository {
  kellyReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>>;
  arrivalsReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>>;
  departuresReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>>;
  servicesReport(pmsPropertyId: number, dateFrom: Date, dateTo: Date): Promise<AxiosResponse<Blob>>;
  transactionsReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AxiosResponse<Blob>>;
  ineReport(pmsPropertyId: number, dateFrom: Date, dateTo: Date): Promise<AxiosResponse<Blob>>;
}
