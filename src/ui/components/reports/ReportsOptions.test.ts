import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';

import ReportsOptions from './ReportsOptions.vue';

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

vi.mock('lucide-vue-next', () => ({
  BrushCleaning: {
    template: '<span aria-label="cleaning icon"></span>',
  },
  BaggageClaim: {
    template: '<span aria-label="arrivals icon"></span>',
  },
  DoorOpen: {
    template: '<span aria-label="departures icon"></span>',
  },
  HandPlatter: {
    template: '<span aria-label="services icon"></span>',
  },
  Banknote: {
    template: '<span aria-label="transactions icon"></span>',
  },
  ChartPie: {
    template: '<span aria-label="ine icon"></span>',
  },
}));

describe('ReportsOptions', () => {
  it('renders subtitle and all report options', () => {
    render(ReportsOptions);

    // Subtitle text
    expect(screen.getByText('Choose a report')).toBeInTheDocument();

    // All option labels
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Departures')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('INE')).toBeInTheDocument();
  });

  it('renders one icon for each report option', () => {
    render(ReportsOptions);

    expect(screen.getByLabelText(/cleaning icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/arrivals icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departures icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/services icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/transactions icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ine icon/i)).toBeInTheDocument();
  });

  it('emits "selectedReport" with correct payload when option text is clicked', async () => {
    const { emitted } = render(ReportsOptions);

    await fireEvent.click(screen.getByText('Cleaning'));
    await fireEvent.click(screen.getByText('Arrivals'));
    await fireEvent.click(screen.getByText('Departures'));
    await fireEvent.click(screen.getByText('Services'));
    await fireEvent.click(screen.getByText('Transactions'));
    await fireEvent.click(screen.getByText('INE'));

    const events = emitted().selectedReport;
    expect(events).toHaveLength(6);

    expect(events[0]).toEqual(['kelly']);
    expect(events[1]).toEqual(['arrivals']);
    expect(events[2]).toEqual(['departures']);
    expect(events[3]).toEqual(['services']);
    expect(events[4]).toEqual(['transactions']);
    expect(events[5]).toEqual(['ine']);
  });

  it('emits "selectedReport" when the icon inside each option is clicked', async () => {
    const { emitted } = render(ReportsOptions);

    // Clicking on the icon should bubble up to the square div
    await fireEvent.click(screen.getByLabelText(/cleaning icon/i));
    await fireEvent.click(screen.getByLabelText(/arrivals icon/i));
    await fireEvent.click(screen.getByLabelText(/departures icon/i));
    await fireEvent.click(screen.getByLabelText(/services icon/i));
    await fireEvent.click(screen.getByLabelText(/transactions icon/i));
    await fireEvent.click(screen.getByLabelText(/ine icon/i));

    const events = emitted().selectedReport;
    expect(events).toHaveLength(6);

    expect(events[0]).toEqual(['kelly']);
    expect(events[1]).toEqual(['arrivals']);
    expect(events[2]).toEqual(['departures']);
    expect(events[3]).toEqual(['services']);
    expect(events[4]).toEqual(['transactions']);
    expect(events[5]).toEqual(['ine']);
  });

  it('does not emit when clicking on the subtitle text', async () => {
    const { emitted } = render(ReportsOptions);

    await fireEvent.click(screen.getByText('Choose a report'));

    expect(emitted().selectedReport).toBeUndefined();
  });

  it('each square is fully clickable (label click delegates to parent .square)', async () => {
    const { emitted, container } = render(ReportsOptions);

    // Find the first square
    const squares = container.querySelectorAll('.square');
    const firstSquare = squares[0];

    // Click ANYWHERE inside the square (not the text, not the icon)
    await fireEvent.click(firstSquare);

    const events = emitted().selectedReport;
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(['kelly']);
  });

  it('renders report options in the expected order', () => {
    const { container } = render(ReportsOptions);

    const squares = Array.from(container.querySelectorAll('.square'));

    const labels = squares.map((sq) => sq.textContent?.trim());

    expect(labels).toEqual([
      'Cleaning',
      'Arrivals',
      'Departures',
      'Services',
      'Transactions',
      'INE',
    ]);
  });
});
