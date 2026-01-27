import type { AxiosResponse } from 'axios';

import { api } from '@/infrastructure/http/axios';
import type { ReportsRepository } from '@/domain/repositories/ReportsRepository';

const dateToStringAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class ReportsRepositoryImpl implements ReportsRepository {
  async kellyReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>> {
    return api.get(
      `/reports/kelly-report?pmsPropertyId=${pmsPropertyId}&dateFrom=${dateToStringAPI(date)}`,
      { responseType: 'blob' },
    );
  }

  async arrivalsReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>> {
    return api.get(
      `/reports/arrivals-report?pmsPropertyId=${pmsPropertyId}&dateFrom=${dateToStringAPI(date)}`,
      { responseType: 'blob' },
    );
  }

  async departuresReport(pmsPropertyId: number, date: Date): Promise<AxiosResponse<Blob>> {
    return api.get(
      `/reports/departures-report?pmsPropertyId=${pmsPropertyId}&dateFrom=${dateToStringAPI(date)}`,
      { responseType: 'blob' },
    );
  }

  async servicesReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AxiosResponse<Blob>> {
    return api.get(
      `/reports/services-report?pmsPropertyId=${pmsPropertyId}&dateFrom=${dateToStringAPI(
        dateFrom,
      )}&dateTo=${dateToStringAPI(dateTo)}`,
      { responseType: 'blob' },
    );
  }

  async transactionsReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AxiosResponse<Blob>> {
    return api.get(
      `/reports/transactions-report?pmsPropertyId=${pmsPropertyId}&dateFrom=${dateToStringAPI(
        dateFrom,
      )}&dateTo=${dateToStringAPI(dateTo)}`,
      { responseType: 'blob' },
    );
  }

  async ineReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AxiosResponse<Blob>> {
    return api.get(
      `/reports/ine-report?pmsPropertyId=${pmsPropertyId}&dateFrom=${dateToStringAPI(
        dateFrom,
      )}&dateTo=${dateToStringAPI(dateTo)}`,
      { responseType: 'blob' },
    );
  }
}
