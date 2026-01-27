// ReportsGeneration.test.ts
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';

import ReportsGeneration from './ReportsGeneration.vue';

// ---- i18n mock ----
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'reports.back': 'Back',
    'reports.dateLabel': 'Date',
    'reports.dateFromLabel': 'Date from',
    'reports.dateToLabel': 'Date to',
    'reports.dateFormatPlaceholder': 'dd/mm/yyyy',
    'reports.cleaningReportLongName': 'Cleaning report',
    'reports.cleaningReportShortName': 'Cleaning',
    'reports.checkinReportLongName': 'Arrivals report',
    'reports.checkinReportShortName': 'Arrivals',
    'reports.checkoutReportLongName': 'Departures report',
    'reports.checkoutReportShortName': 'Departures',
    'reports.servicesReportLongName': 'Services report',
    'reports.servicesReportShortName': 'Services',
    'reports.paymentsReportLongName': 'Transactions report',
    'reports.paymentsReportShortName': 'Transactions',
    'reports.ineReportLongName': 'INE report',
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

// ---- UI store mock ----
const startLoading = vi.fn();
const stopLoading = vi.fn();

vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({
    startLoading,
    stopLoading,
  }),
}));

// ---- Reports service mocks ----
const kellyReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });
const arrivalsReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });
const departuresReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });
const servicesReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });
const transactionsReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });
const ineReportMock = vi.fn().mockResolvedValue({ data: 'AAA' });

vi.mock('@/application/reports/ReportsService', () => ({
  ReportsService: vi.fn().mockImplementation(() => ({
    kellyReport: kellyReportMock,
    arrivalsReport: arrivalsReportMock,
    departuresReport: departuresReportMock,
    servicesReport: servicesReportMock,
    transactionsReport: transactionsReportMock,
    ineReport: ineReportMock,
  })),
}));

// ---- Repository mock ----
vi.mock('@/infrastructure/repositories/ReportsRepositoryImpl', () => ({
  ReportsRepositoryImpl: vi.fn(),
}));

// ---- PrimeVue stubs ----
const ButtonStub = {
  props: {
    label: { type: String, required: false },
    disabled: { type: Boolean, required: false },
  },
  emits: ['click'],
  template: `
    <button type="button" :disabled="disabled" @click="$emit('click')">
      {{ label }}
    </button>
  `,
};

const DatePickerStub = {
  props: {
    modelValue: {
      type: [Date, String, null],
      required: false,
      default: null,
    },
  },
  emits: ['update:modelValue'],

  // This stub emits a valid Date when clicked.
  // Testing Library prefers role-based queries, but there is no better
  // accessible role here, so testId is acceptable.
  template: `
    <input
      type="text"
      data-testid="datepicker"
      @click="$emit('update:modelValue', new Date())"
    />
  `,
};

const MessageStub = {
  template: `<div><slot /></div>`,
};

// ---- Render helper ----
function renderReportsGeneration(reportType: string = 'kelly') {
  return render(ReportsGeneration, {
    props: { reportType },
    global: {
      stubs: {
        Button: ButtonStub,
        DatePicker: DatePickerStub,
        Message: MessageStub,
      },
    },
  });
}

// ---- Tests ----
describe('ReportsGeneration', () => {
  beforeEach(() => {
    // Ensure all mocks are reset before each test run
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  // ---------- Per report type UI tests ----------
  type ReportCase = {
    reportType: string;
    title: string;
    description: string;
    expectsSecondDate: boolean;
    firstDateLabel: string;
  };

  const reportCases: ReportCase[] = [
    {
      reportType: 'kelly',
      title: 'Cleaning report',
      description: 'Cleaning description',
      expectsSecondDate: false,
      firstDateLabel: 'Date',
    },
    {
      reportType: 'arrivals',
      title: 'Arrivals report',
      description: 'Arrivals description',
      expectsSecondDate: false,
      firstDateLabel: 'Date',
    },
    {
      reportType: 'departures',
      title: 'Departures report',
      description: 'Departures description',
      expectsSecondDate: false,
      firstDateLabel: 'Date',
    },
    {
      reportType: 'services',
      title: 'Services report',
      description: 'Services description',
      expectsSecondDate: true,
      firstDateLabel: 'Date from',
    },
    {
      reportType: 'transactions',
      title: 'Transactions report',
      description: 'Payments description',
      expectsSecondDate: true,
      firstDateLabel: 'Date from',
    },
    {
      reportType: 'ine',
      title: 'INE report',
      description: 'INE description',
      expectsSecondDate: true,
      firstDateLabel: 'Date from',
    },
  ];

  reportCases.forEach(({ reportType, title, description, expectsSecondDate, firstDateLabel }) => {
    it(`renders correct title, description and date fields for "${reportType}" report`, () => {
      renderReportsGeneration(reportType);

      // Title
      expect(screen.getByText(title)).toBeInTheDocument();

      // Description inside Message
      expect(screen.getByText(description)).toBeInTheDocument();

      // First date label depends on report type
      expect(screen.getByText(firstDateLabel)).toBeInTheDocument();

      // Second date label only for services / transactions / ine
      if (expectsSecondDate) {
        expect(screen.getByText('Date to')).toBeInTheDocument();
      } else {
        expect(screen.queryByText('Date to')).not.toBeInTheDocument();
      }
    });
  });

  // ---------- Generation button behaviour ----------

  it('disables and enables the generate button based on date selection for "kelly" report', async () => {
    renderReportsGeneration('kelly');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });

    // The button must be disabled at first because no date has been selected
    expect(generateButton).toBeDisabled();

    // Select dateFrom
    await fireEvent.click(screen.getByTestId('datepicker'));

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('requires both dates and enables the generate button for "services" report', async () => {
    renderReportsGeneration('services');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });

    // Initially disabled
    expect(generateButton).toBeDisabled();

    const dateInputs = screen.getAllByTestId('datepicker');

    // Click only dateFrom
    await fireEvent.click(dateInputs[0]);

    // Still disabled because dateTo is missing
    expect(generateButton).toBeDisabled();

    // Click dateTo
    await fireEvent.click(dateInputs[1]);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  // ---------- Service calls ----------

  it('calls kellyReport service and triggers download for "kelly" report', async () => {
    // Spy on anchor click to simulate a download
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderReportsGeneration('kelly');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });

    // Select the date first
    await fireEvent.click(screen.getByTestId('datepicker'));

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    // Trigger generation
    await fireEvent.click(generateButton);

    await waitFor(() => {
      // UI store loading state calls
      expect(startLoading).toHaveBeenCalledTimes(1);
      expect(stopLoading).toHaveBeenCalledTimes(1);

      // Service call
      expect(kellyReportMock).toHaveBeenCalledTimes(1);
      const [propertyIdArg, dateArg] = kellyReportMock.mock.calls[0];

      expect(propertyIdArg).toBe(1);
      expect(dateArg).toBeInstanceOf(Date);

      // Download was attempted
      expect(anchorClickSpy).toHaveBeenCalled();
    });

    anchorClickSpy.mockRestore();
  });

  it('calls the proper service for "arrivals" report', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderReportsGeneration('arrivals');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });

    await fireEvent.click(screen.getByTestId('datepicker'));

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    await fireEvent.click(generateButton);

    await waitFor(() => {
      expect(arrivalsReportMock).toHaveBeenCalledTimes(1);
    });

    anchorClickSpy.mockRestore();
  });

  it('calls the proper service for "departures" report', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderReportsGeneration('departures');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });

    await fireEvent.click(screen.getByTestId('datepicker'));

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    await fireEvent.click(generateButton);

    await waitFor(() => {
      expect(departuresReportMock).toHaveBeenCalledTimes(1);
    });

    anchorClickSpy.mockRestore();
  });

  it('calls the proper service for "services" report', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderReportsGeneration('services');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });
    const dateInputs = screen.getAllByTestId('datepicker');

    await fireEvent.click(dateInputs[0]);
    await fireEvent.click(dateInputs[1]);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    await fireEvent.click(generateButton);

    await waitFor(() => {
      expect(servicesReportMock).toHaveBeenCalledTimes(1);
    });

    anchorClickSpy.mockRestore();
  });

  it('calls the proper service for "transactions" report', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderReportsGeneration('transactions');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });
    const dateInputs = screen.getAllByTestId('datepicker');

    await fireEvent.click(dateInputs[0]);
    await fireEvent.click(dateInputs[1]);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    await fireEvent.click(generateButton);

    await waitFor(() => {
      expect(transactionsReportMock).toHaveBeenCalledTimes(1);
    });

    anchorClickSpy.mockRestore();
  });

  it('calls the proper service for "ine" report', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderReportsGeneration('ine');

    const generateButton = screen.getByRole('button', {
      name: /generate report/i,
    });
    const dateInputs = screen.getAllByTestId('datepicker');

    await fireEvent.click(dateInputs[0]);
    await fireEvent.click(dateInputs[1]);

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    await fireEvent.click(generateButton);

    await waitFor(() => {
      expect(ineReportMock).toHaveBeenCalledTimes(1);
    });

    anchorClickSpy.mockRestore();
  });

  it('renders a Back button using i18n label', () => {
    renderReportsGeneration('kelly');

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });
});
