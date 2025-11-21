// Reports.test.ts
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';

import Reports from './Reports.vue';

describe('Reports', () => {
  it('renders ReportsOptions on first load and switches to ReportsGeneration when a report is selected', async () => {
    const { queryByText } = render(Reports, {
      global: {
        stubs: {
          ReportsOptions: {
            template: `
              <div>
                <p>Options stub</p>
                <button type="button" @click="$emit('selectedReport', 'kelly')">
                  Select Kelly
                </button>
              </div>
            `,
          },
          ReportsGeneration: {
            props: ['reportType'],
            template: `
              <div>
                <p>Generation stub - {{ reportType }}</p>
                <button type="button" @click="$emit('back')">
                  Back
                </button>
              </div>
            `,
          },
        },
      },
    });

    // Initially, only ReportsOptions should be visible
    expect(screen.getByText('Options stub')).toBeInTheDocument();
    expect(queryByText(/Generation stub/)).not.toBeInTheDocument();

    // Click on "Select Kelly" to emit selectedReport
    await fireEvent.click(screen.getByText('Select Kelly'));

    // Now ReportsGeneration stub should be rendered with correct reportType
    expect(queryByText('Options stub')).not.toBeInTheDocument();
    expect(screen.getByText('Generation stub - kelly')).toBeInTheDocument();
  });

  it('returns to ReportsOptions when ReportsGeneration emits "back"', async () => {
    const { queryByText } = render(Reports, {
      global: {
        stubs: {
          ReportsOptions: {
            template: `
              <div>
                <p>Options stub</p>
                <button type="button" @click="$emit('selectedReport', 'kelly')">
                  Select Kelly
                </button>
              </div>
            `,
          },
          ReportsGeneration: {
            props: ['reportType'],
            template: `
              <div>
                <p>Generation stub - {{ reportType }}</p>
                <button type="button" @click="$emit('back')">
                  Back
                </button>
              </div>
            `,
          },
        },
      },
    });

    // Go to generation view
    await fireEvent.click(screen.getByText('Select Kelly'));
    expect(screen.getByText('Generation stub - kelly')).toBeInTheDocument();

    // Click back and verify options are shown again
    await fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Options stub')).toBeInTheDocument();
    expect(queryByText(/Generation stub/)).not.toBeInTheDocument();
  });
});
