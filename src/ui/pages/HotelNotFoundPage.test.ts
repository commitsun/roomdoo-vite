import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

import HotelNotFoundPage from './HotelNotFoundPage.vue';

import primevuePlugin from '@/infrastructure/plugins/primevue';

// Mock window.location
const mockLocation = {
  href: 'https://test-hotel.roomdoo.com:3000/login',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (
        key === 'instanceNotFound.title' &&
        params?.instance !== null &&
        params?.instance !== undefined &&
        params.instance !== ''
      ) {
        return `Instance ${params.instance} not found`;
      }
      return key;
    },
  }),
}));

describe('HotelNotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hotel not found page correctly', () => {
    render(HotelNotFoundPage, {
      global: {
        plugins: [primevuePlugin],
        components: {
          Button,
          Divider,
        },
        stubs: {
          TriangleAlert: true,
        },
      },
    });

    expect(screen.getByAltText('Roomdoo Logo')).toBeTruthy();
    expect(screen.getByText(/Instance.*not found/)).toBeTruthy();
    expect(screen.getByText('hotel_not_found_description')).toBeTruthy();
    expect(screen.getByText('hotel_not_found_contact')).toBeTruthy();
    expect(screen.getByText('sign_up')).toBeTruthy();
  });

  it('extracts instance name from URL', () => {
    render(HotelNotFoundPage, {
      global: {
        plugins: [primevuePlugin],
        components: {
          Button,
          Divider,
        },
        stubs: {
          TriangleAlert: true,
        },
      },
    });

    // The instance name should be extracted from the mocked URL
    expect(screen.getByText(/test-hotel/)).toBeTruthy();
  });

  it('displays contact email', () => {
    render(HotelNotFoundPage, {
      global: {
        plugins: [primevuePlugin],
        components: {
          Button,
          Divider,
        },
        stubs: {
          TriangleAlert: true,
        },
      },
    });

    expect(screen.getByText('instanceNotFound.contactWithUs')).toBeTruthy();
    const emailLink = screen.getByText('hola@roomdoo.com');
    expect(emailLink).toBeTruthy();
    expect(emailLink.closest('a')?.getAttribute('href')).toBe('mailto: hola@roomdoo.com');
  });

  it('opens Roomdoo website when sign up button is clicked', async () => {
    render(HotelNotFoundPage, {
      global: {
        plugins: [primevuePlugin],
        components: {
          Button,
          Divider,
        },
        stubs: {
          TriangleAlert: true,
        },
      },
    });

    const signUpButton = screen.getByText('sign_up');
    await fireEvent.click(signUpButton);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://roomdoo.com', '_blank');
  });
});
