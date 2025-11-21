// ReportsGeneration.test.ts
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';

import ReportsGeneration from './ReportsGeneration.vue';

// i18n mock
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'reports.back': 'Back',
    'reports.dateLabel': 'Date',
    'reports.dateFromLabel': 'Date from',
    'reports.dateToLabel': 'Date to',
    'reports.dateFormatPlaceholder': 'dd/mm/yyyy',
    'reports.cleaningReportLongName': 'Cleaning report',
    'reports.cleaningReportShortName': 'Cleaning',
    'reports.checkinReportShortName': 'Arrivals',
    'reports.checkoutReportShortName': 'Departures',
    'reports.servicesReportShortName': 'Services',
    'reports.paymentsReportShortName': 'Transactions',
    'reports.ineReportShortName': 'INE',
    'reports.cleaningReportDescription': 'Cleaning description',
    'reports.checkinReportDescription': 'Arrivals description',
    'reports.checkoutReportDescription': 'Departures description',
    'reports.servicesReportDescription': 'Services description',
    'reports.paymentsReportDescription': 'Payments description',
    'reports.ineReportDescription': 'INE description',
    'reports.cancel': 'Cancel',
    'reports.generateReport': 'Generate report',
  };

  return {
    useI18n: () => ({
      t: (key: string) => tMap[key] ?? key,
    }),
  };
});

// ui store mock
const startLoading = vi.fn();
const stopLoading = vi.fn();

vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({
    startLoading,
    stopLoading,
  }),
}));

// ReportsService mock
const kellyReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });

vi.mock('@/application/reports/ReportsService', () => ({
  ReportsService: vi.fn().mockImplementation(() => ({
    kellyReport: kellyReportMock,
    arrivalsReport: vi.fn(),
    departuresReport: vi.fn(),
    servicesReport: vi.fn(),
    transactionsReport: vi.fn(),
    ineReport: vi.fn(),
  })),
}));

vi.mock('@/infrastructure/repositories/ReportsRepositoryImpl', () => ({
  ReportsRepositoryImpl: vi.fn(),
}));

// PrimeVue stubs
const ButtonStub = {
  props: ['label', 'disabled'],
  emits: ['click'],
  template: `
    <button type="button" :disabled="disabled" @click="$emit('click')">
      {{ label }}
    </button>
  `,
};

const DatePickerStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `
    <input
      type="text"
      data-testid="datepicker"
      @click="$emit('update:modelValue', new Date('2024-01-01'))"
    />
  `,
};

const MessageStub = {
  template: `<div><slot /></div>`,
};

describe('ReportsGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables and enables the generate button based on dates for "kelly" report', async () => {
    render(ReportsGeneration, {
      props: { reportType: 'kelly' },
      global: {
        stubs: {
          Button: ButtonStub,
          DatePicker: DatePickerStub,
          Message: MessageStub,
        },
      },
    });

    const generateButton = screen.getByRole('button', { name: /generate report/i });

    // Initially the button should be disabled because no dateFrom is selected
    expect(generateButton).toBeDisabled();

    const dateInput = screen.getByTestId('datepicker');
    await fireEvent.click(dateInput);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('calls kellyReport and uiStore when generating a "kelly" report', async () => {
    // 👇 mockeamos el click del <a> SOLO para este test
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(ReportsGeneration, {
      props: { reportType: 'kelly' },
      global: {
        stubs: {
          Button: ButtonStub,
          DatePicker: DatePickerStub,
          Message: MessageStub,
        },
      },
    });

    const generateButton = screen.getByRole('button', { name: /generate report/i });
    const dateInput = screen.getByTestId('datepicker');

    // Select dateFrom via stubbed DatePicker
    await fireEvent.click(dateInput);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    await fireEvent.click(generateButton);

    await waitFor(() => {
      // ui store loading calls
      expect(startLoading).toHaveBeenCalledTimes(1);
      expect(stopLoading).toHaveBeenCalledTimes(1);

      // service call
      expect(kellyReportMock).toHaveBeenCalledTimes(1);
      const [propertyIdArg, dateArg] = kellyReportMock.mock.calls[0];
      expect(propertyIdArg).toBe(1);
      expect(dateArg).toBeInstanceOf(Date);

      // opcional: asegurarte de que se ha intentado hacer el "download"
      expect(anchorClickSpy).toHaveBeenCalled();
    });

    // 👇 limpiamos el mock para no afectar a otros tests
    anchorClickSpy.mockRestore();
  });
});
