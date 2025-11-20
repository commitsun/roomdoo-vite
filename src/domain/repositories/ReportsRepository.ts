export interface ReportsRepository {
  kellyReport(pmsPropertyId: number, date: Date): Promise<{ data: string }>;
  arrivalsReport(pmsPropertyId: number, date: Date): Promise<{ data: string }>;
  departuresReport(pmsPropertyId: number, date: Date): Promise<{ data: string }>;
  servicesReport(pmsPropertyId: number, dateFrom: Date, dateTo: Date): Promise<{ data: string }>;
  transactionsReport(
    pmsPropertyId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<{ data: string }>;
  ineReport(pmsPropertyId: number, dateFrom: Date, dateTo: Date): Promise<{ data: string }>;
}
