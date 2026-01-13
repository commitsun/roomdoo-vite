import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/vue';

import Error404Page from './Error404Page.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('Error404Page', () => {
  it('renders the 404 error page correctly', () => {
    render(Error404Page, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('error404.title')).toBeTruthy();
    expect(screen.getByText('error404.message')).toBeTruthy();
    expect(screen.getByText('error404.button')).toBeTruthy();
  });

  it('renders a link to home page', () => {
    render(Error404Page, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    const link = screen.getByText('error404.button').closest('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('/');
  });
});
