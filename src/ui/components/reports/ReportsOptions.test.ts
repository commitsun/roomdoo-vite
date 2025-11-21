// ReportsOptions.test.ts
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/vue';

import ReportsOptions from './ReportsOptions.vue';

// i18n mock
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'reports.subtitle': 'Choose a report',
    'reports.cleaningReportShortName': 'Cleaning',
    'reports.checkinReportShortName': 'Arrivals',
    'reports.checkoutReportShortName': 'Departures',
    'reports.servicesReportShortName': 'Services',
    'reports.paymentsReportShortName': 'Transactions',
    'reports.ineReportShortName': 'INE',
  };

  return {
    useI18n: () => ({
      t: (key: string) => tMap[key] ?? key,
    }),
  };
});

describe('ReportsOptions', () => {
  it('renders all report options', () => {
    const { getByText } = render(ReportsOptions);

    expect(getByText('Choose a report')).toBeInTheDocument();
    expect(getByText('Cleaning')).toBeInTheDocument();
    expect(getByText('Arrivals')).toBeInTheDocument();
    expect(getByText('Departures')).toBeInTheDocument();
    expect(getByText('Services')).toBeInTheDocument();
    expect(getByText('Transactions')).toBeInTheDocument();
    expect(getByText('INE')).toBeInTheDocument();
  });

  it('emits "selectedReport" with the correct payload for each option', async () => {
    const { getByText, emitted } = render(ReportsOptions);

    await fireEvent.click(getByText('Cleaning'));
    await fireEvent.click(getByText('Arrivals'));
    await fireEvent.click(getByText('Departures'));
    await fireEvent.click(getByText('Services'));
    await fireEvent.click(getByText('Transactions'));
    await fireEvent.click(getByText('INE'));

    const events = emitted().selectedReport;
    expect(events).toHaveLength(6);
    expect(events[0]).toEqual(['kelly']);
    expect(events[1]).toEqual(['arrivals']);
    expect(events[2]).toEqual(['departures']);
    expect(events[3]).toEqual(['services']);
    expect(events[4]).toEqual(['transactions']);
    expect(events[5]).toEqual(['ine']);
  });
});
