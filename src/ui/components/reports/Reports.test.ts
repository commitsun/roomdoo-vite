// Reports.test.ts
import '@testing-library/jest-dom/vitest';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';

import Reports from './Reports.vue';

const ReportsOptionsStub = {
  template: `
    <div>
      <p>Options stub</p>
      <button type="button" @click="$emit('selectedReport', 'kelly')">
        Select Kelly
      </button>
      <button type="button" @click="$emit('selectedReport', 'arrivals')">
        Select Arrivals
      </button>
    </div>
  `,
};

const ReportsGenerationStub = {
  props: {
    reportType: { type: String, required: true },
  },
  template: `
    <div>
      <p>Generation stub - {{ reportType }}</p>
      <button type="button" @click="$emit('back')">Back</button>
    </div>
  `,
};

describe('Reports', () => {
  beforeEach(() => {
    render(Reports, {
      global: {
        stubs: {
          ReportsOptions: ReportsOptionsStub,
          ReportsGeneration: ReportsGenerationStub,
        },
      },
    });
  });

  it('shows ReportsOptions initially', () => {
    // Prefer role queries for interactive elements
    expect(screen.getByRole('button', { name: /select kelly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select arrivals/i })).toBeInTheDocument();

    // Text query está bien para contenido estático
    expect(screen.getByText('Options stub')).toBeInTheDocument();
    expect(screen.queryByText(/generation stub/i)).not.toBeInTheDocument();
  });

  it('changes to ReportsGeneration when a report is selected', async () => {
    await fireEvent.click(screen.getByRole('button', { name: /select kelly/i }));

    // Verificamos contenido de la vista de generación por texto
    expect(screen.getByText(/generation stub - kelly/i)).toBeInTheDocument();
    expect(screen.queryByText('Options stub')).not.toBeInTheDocument();
  });

  it('returns to ReportsOptions when back is clicked', async () => {
    await fireEvent.click(screen.getByRole('button', { name: /select kelly/i }));
    expect(screen.getByText(/generation stub - kelly/i)).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByText('Options stub')).toBeInTheDocument();
    expect(screen.queryByText(/generation stub/i)).not.toBeInTheDocument();
  });

  it('passes the correct report type to ReportsGeneration', async () => {
    await fireEvent.click(screen.getByRole('button', { name: /select kelly/i }));

    expect(screen.getByText(/generation stub - kelly/i)).toBeInTheDocument();
  });

  it('allows selecting a different report after going back', async () => {
    // First report
    await fireEvent.click(screen.getByRole('button', { name: /select kelly/i }));
    expect(screen.getByText(/generation stub - kelly/i)).toBeInTheDocument();

    // Back to options
    await fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Options stub')).toBeInTheDocument();
    expect(screen.queryByText(/generation stub/i)).not.toBeInTheDocument();

    // Second, different report
    await fireEvent.click(screen.getByRole('button', { name: /select arrivals/i }));
    expect(screen.getByText(/generation stub - arrivals/i)).toBeInTheDocument();
    expect(screen.queryByText('Options stub')).not.toBeInTheDocument();
  });
});
